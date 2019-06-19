
//BUDGET CONTROLLER
var budgetController = (function() {
	var Expense = function(id , description, value ) {
		this.id = id
		this.description = description
		this.value = value
		this.percentage = -1
	}

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value /totalIncome) * 100)
		} else {
			this.percentage = -1
		}
		
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage
	}

	var Income = function(id , description, value ) {
		this.id = id
		this.description = description
		this.value = value
	}
	
	var calculateTotal = function(type) {
		var sum = 0
		data.allItems[type].forEach(function(cur) {
			sum += cur.value 
		})
		data.totals[type] = sum
	}
	var data = {
		allItems : {
			exp : [],
			inc : []
		},
		totals : {
			exp : 0,
			inc : 0
		}, 
		budget : 0,
		percentage : -1
	}
	return {
		addItem : function(type, des, val) {
			var newItem, ID;
			//create new ID
			if (data.allItems[type].length>0) {
				ID = data.allItems[type][data.allItems[type].length-1].id + 1
			}else {
				ID = 0
			}
		
			//Create new item based on 'inc' and 'exp' type
 			if (type === 'exp') {
				newItem = new Expense(ID, des, val) ;
			}else if (type === 'inc') {
				newItem = new Income(ID, des, val) ;
			}

			//Push it into our data structure
			data.allItems[type].push(newItem)
			return newItem
		},

		deleteItem : function (type, id) {
			var index, ids
			var ids = data.allItems[type].map(function(current) {
			return current.id
			})
			index = ids.indexOf(id)

			if(index !== -1) {
				data.allItems[type].splice(index, 1)
			}
		},

		calculateBudget : function () {

			// Calculate total income and expenses
			calculateTotal('exp')
			calculateTotal('inc')

			//calculate total budget : income-expenses
			data.budget = data.totals.inc - data.totals.exp

			//calculate the percentage
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
			} else {
				data.percentage = -1
			}
			 
		},

		calculatePercentages : function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc)
			})
		},

		getPercentages : function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage(data.totals.inc)
			})
			return allPerc
		},

		getBudget : function() {
			return {
				budget : data.budget,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp,
				percentage : data.percentage
			}
		},
		testing : function () {
			console.log(data)
		} 
	}
})()

//UI CONTROLLE
var UIController = (function() {
	var DOMstrings = {
		inputType : '.add_type',
		inputDescription : '.add_description',
		inputValue : '.add_value',
		inputBtn : '.add_btn',
		incomeContainer: '.income_list',
		expensesContainer: '.expenses_list',
		budgetLabel : '.budget_value',
		incomeLabel : '.budget_income--value',
		expensesLabel : '.budget_expenses--value',
		percentageLabel : '.budget_expenses--percentage',
		container : '.container',
		expensesPercLabel : '.item_percentage',
		dateLabel : '.budget_title--month'
	}

	var formatNumber = function(num , type) {
		var numSplit, int , dec, type
		 //+ or  - before the number exactly 2 decimal points comma separating the thousands
		num = Math.abs(num)
		num = num.toFixed(2)
		numSplit = num.split('.')
		int = numSplit[0]
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
		}
		dec = numSplit[1]
		return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec
	}

	var nodeListEach = function(list, callback) {
		for(var i = 0 ; i < list.length ; i++) {
			callback(list[i] , i)
		}
	}

	return  {
		getInput:function() {
			return {
				type : document.querySelector(DOMstrings.inputType).value,	// Will be either inc or exp
				description : document.querySelector(DOMstrings.inputDescription).value,
				value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},

		addListItem : function(obj, type) {
			var html, newHtml, element
			//Create html String wth placeholder tag
			if(type === 'inc') {
				element = DOMstrings.incomeContainer
				html ='<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if(type === 'exp') {
				element= DOMstrings.expensesContainer
				html ='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			// replace placeholder tag with actual data
			newHtml = html.replace('%id%', obj.id)
			newHtml = newHtml.replace('%description%', obj.description)
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))
			//Insert html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend' , newHtml)
		},

		deleteListItem : function(selectorID) {
			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el)
		},

		clearFields: function () {
			var fields, fieldsArr
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
			fieldsArr = Array.prototype.slice.call(fields)
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			})
			fieldsArr[0].focus()
		}, 
		
		displayBudget: function(obj) {
			var type
			obj.budget > 0 ? type = 'inc' : type = 'exp' 
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
			document.querySelector(DOMstrings.incomeLabel).textContent =formatNumber(obj.totalInc , 'inc')
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp , 'exp')
			
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent =obj.percentage + '%'
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '--'
			}
		},

		displayPercentages : function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel)
			nodeListEach(fields , function(current, index) {
				if(percentages[index] > 0) {
					current.textContent = percentages[index] + '%'
				} else{
					current.textContent = '---'
				}
			})
		},

		displayMonth : function(){
			var now , year, month, months
			now = new Date()
			months = ['January' , 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novenber', 'December']
			month = now.getMonth()
			year = now.getFullYear()
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
		},

		changeType : function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue)
				nodeListEach(fields , function(cur) {
				cur.classList.toggle('red-focus')
			})
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
		},
		getDOMstrings : function() {
			return DOMstrings
		}
	}
})()

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings()
		document.querySelector(DOM.inputBtn).addEventListener("click" ,ctrlAddItem)

		document.addEventListener('keypress', function(event){
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem()
			}

		})
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
	}

	var updateBudget = function() {
		// Calculate the budget
		budgetCtrl.calculateBudget()
		// Return the Budget
		var budget = budgetCtrl.getBudget()
		// Display the Budget on UI
		UICtrl.displayBudget(budget)
	}

	updatePercentages = function() {
		// Calculate Percentages
		budgetCtrl.calculatePercentages()

		// Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages()

		// Update the UI with the percentage
		UICtrl.displayPercentages(percentages)
	}

	var ctrlAddItem = function() {
		var input , newItem

		// Get the fields input data
		input = UICtrl.getInput()
		if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
		//Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description , input.value)

		// Add the item to the UI
			UICtrl.addListItem(newItem, input.type)

		//Clear the fields
			UICtrl.clearFields()

		//Display the budget on the UI
			updateBudget()

		// Calculate and update percentage
			updatePercentages()
		}

	}
	
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID
		itemID= event.target.parentNode.parentNode.parentNode.parentNode.id
		if(itemID) {
			splitID = itemID.split('-')	
			type = splitID[0]
			ID = parseInt(splitID[1]) 
			budgetCtrl.deleteItem(type, ID)
			UICtrl.deleteListItem(itemID)
			updateBudget()
			updatePercentages()
		}
	}

	return {
		init : function() {
			console.log("Application Started")
			UICtrl.displayMonth()
			UICtrl.displayBudget({
				budget : 0,
				totalInc : 0,
				totalExp : 0,
				percentage : -1
			})
			setupEventListeners()
		}
	}
})(budgetController, UIController)
controller.init()