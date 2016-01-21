var Members = function (container_name, page_selection, members_per_page){

	this.objs = [];
	this.container_name = container_name;
	this.page_selection = page_selection;
	this.members_per_page = members_per_page;
	
	this.max_pages = 0;

};

Members.prototype.init = function(callback){

	var _this = this;
}

Members.prototype.getAll = function(callback){
	var _this = this;
	
    $.get("/members")
		.done(function(string) {

			var json = string;

			$.each(json, function(i, obj) {
			
				if (isEmpty(obj.category)) {
					obj.category = "General";
				}
			
				_this.objs.push(obj);
			
			});
			
			if (_this.objs.length % _this.members_per_page == 0) {
				_this.max_pages = _this.objs.length / _this.members_per_page;
			}
			else {
				_this.max_pages = _this.objs.length / _this.members_per_page + 1;
			}
			
			//init paging
			$(jq(_this.page_selection)).bootpag({
					total: _this.max_pages
				}).on("page", function(event, /* page number here */ num){
					 _this.showAllByPage(num);
				});
			
			callback();
	});
};

Members.prototype.filterByCategory = function(category) {

	var _this = this;

	if (category === "All") {
		_this.showAll();
	}
	else {
		var filter = [];
			
		$.each(_this.objs, function(i, obj) {
			if (obj.category === category) {
				filter.push(obj);
			}
		});
		
		_this.show(filter);
	}
};

Members.prototype.filterByText = function(txt) {
	var filter = searchFor(txt, this.objs);
	
	this.show(filter);
};

Members.prototype.createDiv = function(div_id, img, member) {
	var item = "	<div id =" + div_id + " class=\"col-md-4 portfolio-item\"> \
						<img class=\"imgBorder pull-left img-responsive member-pic\" src=\"" + img + "\" alt=\"\"> \
						<h5><span class=\"member-name\">" + member.last_name_english + " " + member.first_name_english + "</span></h5> \
						<!-- <p>" + member.category + "</p> -->\
						<h6><span class=\"member-text\">" + member.company + "</span></h6> \
						<h6><span class=\"member-text\">" + member.position + "</span></h6> \
					</div>"
		
	return item;           				       	
};

Members.prototype.showAll = function(){
	this.show(this.objs);
};

Members.prototype.showAllByPage = function(page){
	this.showByPage(this.objs, page);
};

Members.prototype.show = function(objs_to_show){
	this.showByPage(objs_to_show, 1);
};

Members.prototype.showByPage = function(objs_to_show, page){
	
	//array is zero based
	var page_z = page-1;
	
	var start = page_z*this.members_per_page;
	
	var end = start + this.members_per_page;
	
	var objs_for_page = objs_to_show.slice(start,end);
	
	this.doShow(objs_for_page);
}

Members.prototype.doShow = function(objs_to_show){

	var _this = this;
	
	$(jq(this.container_name)).empty();
	
	//calc number of rows we need
	//3 items per row
	
	var number_of_rows;
	if (objs_to_show.length % 3 ==0) {
		number_of_rows = objs_to_show.length/3;
	}
	else {
		number_of_rows = Math.round(objs_to_show.length/3) + 1;
	}
	
	for (i = 0; i < number_of_rows; i++) {
	
		//create the row
		var row_id = createRandomDivId();
		var row = "<div class=\"row\" id=\"" + row_id + "\"></div>";
		$(jq(this.container_name)).append(row);
	
		//add members to row
		for (j = 0 ; j < 3 ; j++) {
			if (j+3*i >=  objs_to_show.length) {
				break;
			}
			
			var curr_member = objs_to_show[j+3*i];
			
			//create member div
			var div_id = createRandomDivId();
			var div = _this.createDiv(div_id, "img/profile_img.png", curr_member);
			
			//add to row										
			$(jq(row_id)).append(div);
			
			//adjust the mouse over member div
			$(jq( div_id )).hover(function() { // Mouse over
			  $(this).siblings().stop().fadeTo(300, 0.6);
			  $(this).parent().siblings().stop().fadeTo(300, 0.3); 
			  $(this).toggleClass('rotated');
			}, function() { // Mouse out
			  $(this).siblings().stop().fadeTo(300, 1);
			  $(this).parent().siblings().stop().fadeTo(300, 1);
			  $(this).toggleClass('rotated');
			});
		}
	}
};