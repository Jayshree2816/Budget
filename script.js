
//BUDGET CONTROLLER
var budgetController = (function() {
    
})()

//UI CONTROLLE
var UIController = (function() {
	return  {
		getinput:function() {
			
		}
	}
})()

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	var ctrlAddItem = function() {

	}

	document.querySelector('.add_btn').addEventListener("click" ,ctrlAddItem)

	document.addEventListener('keypress', function(event){
		if (event.keyCode === 13 || event.which === 13) {
			ctrlAddItem()
		}

	})
})(budgetController, UIController)