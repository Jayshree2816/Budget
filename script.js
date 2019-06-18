
//BUDGET CONTROLLER
var budgetController = (function() {
	var Expense = function(id , description, value ) {
		this.id = id
		this.description = description
		this.value = value
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
		container : '.container'
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
				html ='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button clas="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			// replace placeholder tag with actual data
			newHtml = html.replace('%id%', obj.id)
			newHtml = newHtml.replace('%description%', obj.description)
			newHtml = newHtml.replace('%value%', obj.value)
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
			document.querySelector(DOMstrings.budgetLabel).textContent =obj.budget
			document.querySelector(DOMstrings.incomeLabel).textContent =obj.totalInc
			document.querySelector(DOMstrings.expensesLabel).textContent =obj.totalExp
			
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent =obj.percentage + '%'
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '--'
			}
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
	}
	var updateBudget = function() {
		// Calculate the budget
		budgetCtrl.calculateBudget()
		// Return the Budget
		var budget = budgetCtrl.getBudget()
		// Display the Budget on UI
		UICtrl.displayBudget(budget)
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
		}
	}

	return {
		init : function() {
			console.log("Application Started")
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