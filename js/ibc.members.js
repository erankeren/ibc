var Members = function (container_name, page_selection, members_per_page){

	this.all_objs = [];
	this.container_name = container_name;
	this.page_selection = page_selection;
	this.members_per_page = members_per_page;
	
	this.max_pages = 0;
	
	this.filter_objs = [];
	
	this.in_filter_mode = false;
	
	this.div_id_to_member_mapping = {};
};


Members.prototype.getAll = function(callback){
	var _this = this;
	
    $.get("/members")
		.done(function(string) {

			var json = string;

			$.each(json, function(i, obj) {
			
				if (isEmpty(obj.category)) {
					obj.category = "General";
				}
			
				_this.all_objs.push(obj);
			
			});
			
			callback();
	});
};

Members.prototype.filterByCategory = function(category) {

	var _this = this;

	if (category === "All") {
		_this.in_filter_mode = false;
	}
	else {
		_this.in_filter_mode = true;
	
		_this.filter_objs = [];
			
		$.each(_this.all_objs, function(i, obj) {
			if (obj.category === category) {
				_this.filter_objs.push(obj);
			}
		});
	}
	
	_this.show();
};

Members.prototype.filterByText = function(txt) {

	var _this = this;
	
	_this.in_filter_mode = true;
	
	_this.filter_objs = searchFor(txt, this.all_objs);
	
	_this.show();
};

Members.prototype.createDiv = function(div_id, img, member) {
	var item = "	<div id =" + div_id + " class=\"col-md-4 portfolio-item\"> \
						<img class=\"imgBorder pull-left img-responsive member-pic\" src=\"" + img + "\" alt=\"\"> \
						<h5><span class=\"member-name\">" + member.last_name_english + " " + member.first_name_english + "</span></h5> \
						<!-- <p>" + member.category + "</p> -->\
						<h6><span class=\"member-text\">" + member.company + "</span></h6> \
						<h6><span class=\"member-text\">" + member.position + "</span></h6> \
						<h9><span style=\"font-size:smaller; color:darkolivegreen; font-weight:200;\">" + member.category + "</span></h9> \
					</div>"
		
	return item;           				       	
};


Members.prototype.show = function(){

	var _this = this;

	var objs_to_show;
	
	if (this.in_filter_mode) {
		objs_to_show = _this.filter_objs;
	}
	else {
		objs_to_show = _this.all_objs;
	}
	
	if (objs_to_show.length <= _this.members_per_page) {
		_this.max_pages = 1;
	}
	else if (objs_to_show.length % _this.members_per_page == 0) {
		_this.max_pages = objs_to_show.length / _this.members_per_page;
	}
	else {
		_this.max_pages = objs_to_show.length / _this.members_per_page + 1;
	}
	
	//paging
	$(jq(_this.page_selection)).bootpag({
			total: _this.max_pages
		}).on("page", function(event, num){
			_this.showByPage(objs_to_show, num);
		});
		
	_this.showByPage(objs_to_show, 1);
	
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
			_this.div_id_to_member_mapping[div_id] = curr_member;
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
			
			//click on member
			$(jq(div_id)).click(function(event) {
				var member = _this.div_id_to_member_mapping[this.id];
				
				var head = "";
				head += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button>"
				head += "<h3 style=\"text-align:center; padding-bottom:20px;\"><span class=\"label label-primary\">" + member.category + "</span></h3>";
				head += "<h4 class=\"member-name modal-title\">" + member.last_name_english + " " + member.first_name_english + "</h4>";
				head += "<h4 class=\"member-name modal-title\">" + member.last_name_hebrew + " " + member.first_name_hebrew + "</h4>";
				head += "<h6><span class=\"member-text\">" + member.company + "</span></h6>";
				head += "<h6><span class=\"member-text\">" + member.position + "</span></h6>";
				
				var body = "";
				body += "<h6><span>" + member.email + "</span></h6>";
				body += "<h6><span>" + member.phone + "</span></h6>";
				
				var webpage = member.webpage.replace(/(?:\r\n|\r|\n)/g, ',');				
 				var str_array = webpage.split(',');
 				for(var i = 0; i < str_array.length; i++) {
 					// Trim the excess whitespace.
 					str_array[i] = str_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
 					body += "<h6><a href=\"#\"\">" + str_array[i] + "</a></h6>";
 				}
 				
 				
 				var footer = "";
 				footer += "<button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>"
				
				$(jq("member-modal-header")).html(head);
				$(jq("member-modal-body")).html(body);
				$(jq("member-modal-footer")).html(footer);
				
				
				$(jq("moreInfoModal")).modal().on('hidden.bs.modal', function () {
					// do something…
				});
			});
		}
	}
};