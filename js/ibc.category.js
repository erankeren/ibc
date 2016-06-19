var Categories = function (container_name, category_text_id, change_callback){

	this.container_name = container_name;
	this.category_text_id = category_text_id;
	this.change_callback = change_callback;
	
	this.categories = [];
	this.categories_id_mapping = {};

};

Categories.prototype.getAll = function(){
	return this.categories;
};

Categories.prototype.fetchFromServer = function(callback){
	
	var _this = this;

	$.get("/categories")
		.done(function(string) {

			var json = string;

			$.each(json, function(i, obj) {
			
				_this.categories.push(obj.category);
			});
			
			callback();
			
	});
};

Categories.prototype.fill = function(){

	var _this = this;
	
	if (_this.categories.indexOf("General") == -1) {
		_this.categories.push("General");
	}
		
	_this.categories.sort();
	
	_this.categories.unshift("All");

	$.each(_this.categories, function(i, obj) {
	
		var id = createRandomDivId();
				
		_this.categories_id_mapping[id] = obj;
		
		$(jq(_this.container_name)).append("<li><a href=\"#\" id=" + id + ">" + obj + "</a></li>");
		
		if (obj === "All") {
			$(jq(_this.container_name)).append("<li role=\"separator\" class=\"divider\"></li>");
		
		}
		
		$( jq( id )).click(function(event) {
			event.preventDefault();
			
			var cat_id = $(this).attr('id');
			
			var cat = _this.categories_id_mapping[cat_id];
			
			$(jq( _this.category_text_id )).html(cat +' <span class="caret"></span>');
			
			_this.change_callback(cat);
			
		});
		
	});
};

