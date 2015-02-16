
define(['api','settings'], function (API,Settings) {


	

	var fileComposer = function() {
		var that=this;	
		var fileObj;
		var id;
		var api;
		var level;
    var data;
    var topPath;

		this.configure = function (options){
      that.api = new API();
      that.api.configureFileModule(options,function(data){
        that.data = jQuery.parseJSON( data );
        that.setListeners();  
      });
      

		}
		this.start = function (id,base){
			this.id =id;
			this.level=0;
	    this.api.getFiles('',base,this.updateView);

		}
		this.takespaces = function(name){ return name.replace(/\s+/g, '');}

		this.setListeners = function(){

			$(document).on('click','#newFolder', function(){
            debugger;
        		var element =$(this);
        		var tr = $(element).parent().parent();
        		var td = $(tr).find('.folder').parent().parent();
        		var id = $(td).attr("id");
        		that.data.elementID = id;
        		that.newFolder();
      		});

      		$(document).on('click','.folder',function(){
      			var td = $(this).parent().parent();
		        var tr = $(td).parent();
		        var folderName = that.takespaces($(this).text());
		        var id = $(td).attr("id");
		        that.level++;
		        that.api.drillDown(id,that.updateView);
		        
		        
		    });

		    $(document).on('click','#drillUp',function(){
		    	that.level--;
		    	that.api.drillUp(that.updateView);


		    });

        $(document).on('click','#deleteFile', function(){
          var element =$(this);
          var tr = $(element).parent().parent();
          var td = $(tr).find('.file');
          var id = $(td).attr("id");
          that.data.elementID = id;
          that.data.deleteAction='file';
          $('#deleteModal').modal('show');
        });

        $(document).on('click','#deleteOK', function(){

          if (that.data.deleteAction==='folder'){
            that.deleteFolder();
          }else{
            that.deleteFile();
          }
        });

        $(document).on('click','#deleteFolder', function(){
          var element =$(this);
          var tr = $(element).parent().parent();
          var td = $(tr).find('.folder').parent().parent();
          var id = $(td).attr("id");
          that.data.elementID = id;
          that.data.deleteAction='folder';
          $('#deleteModal').modal('show');
        

      });
      $(document).on('click','#uploadFile', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.folder').parent().parent();
        var id = $(td).attr("id");
        that.data.elementID = id;
        that.uploadFile();

      });
      $(document).on("click",'#createFolderOK', function(){
        
        var folderToCreate = $('#folderName').val();
        $('#folderName').val('');
        that.api.createFolder('',that.data.elementID,that.takespaces(folderToCreate),'_ID',that.updateView);

      });
      $(document).on('click','#downloadFile', function(){
        var element =$(this);
        var td = $(element).parent();
        var tr = $(td).parent();
        var upTD = $(tr).find('.file');
        var id = $(upTD).attr("id");
        that.data.elementID = id;
        that.downloadFile(0);

      });
       $(document).on('click','#viewFile', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.file');
        var id = $(td).attr("id");
        that.data.elementID = id;
        that.viewFile();

      });
      $(document).find('input[type=file]').on('click',function(){
        this.value = null;

      })
      
      $(document).find('input[type=file]').bind("change", function (e) {
           var file = this.files[0];

           if (file) {
               // if file selected, do something
               //S$('#uploadedModal').modal('show');
               that.prepareUpload(e);
          } else {
              // if user clicks 'Cancel', do something
          }
      });
      $(document).on('click','#renameFolder',function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.folder').parent().parent();
        var id = $(td).attr("id");
        that.api.renameFolder(id,'_ID');
      });
      $(document).on('click','#downloadFolder', function(){
        debugger;
        var count=0;
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.folder').parent().parent();
        var id = $(td).attr("id");
        that.data.elementID = id;
        that.api.downloadFolder(id,'_ID',function(responce){
          if (responce.indexOf('error')===-1){
            if (responce.indexOf('/')!=-1){
              var array = responce.split('/');
              var foldername = array[array.length-1];
              if (foldername==='') foldername = array[array.length-2];
              

            }else{
              var array = responce.split('\\');
              var foldername = array[array.length-1];
              if (foldername==='') foldername = array[array.length-2];
            }
            var settings = new Settings();
            var zipFolder = settings.getZipFolder();
            var path = foldername;
            var downloadURL = settings.getUrlDownload();
            var url = downloadURL+'?path='+path+'&key='+'&study=_PATH';
            var hiddenIFrameID = 'hiddenDownloader' + count++;
            var iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.src = url;
            // setTimeout((function(iframe) {
            //    return function() { 
            //      iframe.remove(); 
            //    }
            // })(iframe), 2000);


           

          }else{
            alert(responce);
          }

        });
      });
      $(document).on('click','#FileoverwriteYes',function(e){
        var existfiles = that.data.existfiles;
        var data = that.data.FormData;
        $("#overwriteFileName .mycheckbox:checked").each(function(){
          var filename = $(this).attr("value");
          for (var i=0;i<existfiles.length;i++){
            var file = existfiles[i];
            if (file.key===filename){
              var key = file.formkey;
              var value = file.formvalue;
              data.append(key, value);
            }
          }
          //alert($(this).attr("value"));
        });
        $('#overwrite').modal('hide');
        data.append('study','_CURRENT');
        data.append('cmd','UploadFile');
        that.api.uploadFile(data,that.updateView);

      });
      
      $(document).on('click','[type=checkbox]',function(){
          // var check =$(this);
          // var td = $(check).parent().parent();
          // if ($(td).attr("id").indexOf("folder")==-1) return;
          // var span = $(td).find('#folderNameR');
          // if (span===undefined) return;
          // var folderName = $(span).text();
          // if ($(check).prop('checked')){
          //   var currentFolder={};
          //   currentFolder.name = folderName;
          //   currentFolder.id = id;
          //   //currentFolder.state=state;
          //   model.currentFolder = currentFolder;
          
          //   $('#currentName').text(folderName);
          // }else{
          //   var current = model.currentFolder;
          //   var name = current.name;
          //   if(name===folderName){
          //     $('#currentName').text('');
          //     model.currentFolder=undefined;

          //   }
            
          // }
          

      });
      $(document).on('click','#multiple', function(){
        var count=0;
        $( '.check' ).each(function( index ) {
          var input = $(this);
          var tr  = $(input).parent().parent();
          var id = $(tr).attr("id");
          if (id===undefined){
            var upTD = $(tr).find('.file');
            id = $(upTD).attr("id");
          }
          
          if ($(input).prop('checked')){
            
            that.data.elementID = id;
            that.downloadFile(count++);
            $(this).attr('checked', false);

          }
        });
      });
      $(document).on('click','#multipleDelete', function(){
        var modelid=[];
        $( '.check' ).each(function( index ) {
          var input = $(this);
          if ($(input).prop('checked')){

            var span  = $(input).parent();
            var td = $(span).parent();
            var id = $(td).attr("id");
            var current = model.currentFolder;
            var name = $(span).text();
            var type='file';
            var obj={};
            obj.id =id;
            obj.name=name;
            obj.type=type;
            if (current===undefined || current===null || current.id!=id){
              modelid.push(obj);  
            }
            
            

          } 
        });
        var text='';
        for (var i=0;i<modelid.length;i++){ text=text+modelid[i].name+'<br>';}
        $('#listOfFiles').html(text);
        $('#deleteMultipleModal').modal('show');
        $(document).one("click",'#deleteMultipleOK',function(){
          console.log('inside delete dialog');          
          for (var i=0;i<modelid.length;i++){
            var obj =modelid[i];
            var input = $('#'+obj.id);
            that.data.elementID = obj.id;
            if (obj.type==='folder'){
              api.deleteFolder(that.data.elementID,'','_ID',function(){
                if (i===modelid.length){
                  that.updateView();
                }
              });
              

            }else{
              
              api.deleteFolder(that.data.elementID,'','_ID',function(){
                if (i===modelid.length){
                  that.updateView();
                }
              });
            } 
            
          }
        });
        

      });
      $(document).on('hidden.bs.modal','#overwrite', function () {
        //alert('hidden event fired!');
        if (that.data.clickedYes){
           var info = that.data.Modalinfo;
           var data= info.data;
           var study = info.study;
           var path = info.path;
           info.visited++;
           var existFiles = that.data.exist;
           if (info.visited>existFiles.length) return;
           var all = $('#applytoall').prop('checked');
           var fileText = $('#overwriteFileName').text();
           var words = fileText.split(' ');
           var name = words[5];
           for (var x=0;x<existFiles.length;x++){
             var file  = existFiles[x];
             if (file.key===name){
               file.overwrite=true;
             }
           }

          $('#overwrite').modal('hide');
          info.index++;
          if (!all){
            that.setModals(model);  
          }else{
            that.data.done=true;
            that.data.all=true;
          }
          
          if (that.data.done===true){
            if (that.data.all===true){
            for (var z=0;z<existFiles.length;z++){
              var file = existFiles[z];
              data.append(file.key, file.val);
            }
            }else{
              for (var t=0;t<existFiles.length;t++){
                var file = existFiles[t];
                if (file.overwrite=true){
                  data.append(file.formkey, file.formvalue);  
                }
              }
            }
            data.append('UserKey','');
            data.append('folder',takespaces(path));
            data.append('study','_CURRENT');
            data.append('cmd','UploadFile');
            that.api.uploadFile(data,that.updateView);
          }

        }
        that.data.clickedYes=false;
      });

		}
    this.prepareUpload = function(event){
      var data =new FormData();
      that.data.formdata=data; 
      that.createExistFilesArray(event.target.files,data);
      var exist = that.data.existfiles;
      if (exist.length>0){
        $('#overwrite').modal('show');
      }else{

        data.append('study','_CURRENT');
        data.append('cmd','UploadFile');
        that.api.uploadFile(data,that.updateView);

      }

    }
    this.createExistFilesArray = function(files,data){
      var existFiles = new Array();
      var thisContext=this; 
      for (var i=0;i<files.length;i++){
        var key = i;
        var value = files[i];
      
        that.api.fileExist(key,'','','_CURRENT',value.name,function(resdata){
          var res;
          if (resdata=='yes'){
            res=true;
          }else{
            res=false;
          }
          if (res){
            var file={};
            file.key =value.name;
            file.formkey = key;
            file.formvalue = value;
            existFiles.push(file);
            $('#overwriteFileName').append('<input type="checkbox" class="mycheckbox" name="vehicle" value="'+value.name+'"> '+value.name+'<br>');
          }else{
            data.append(key, value);
          }
          
          
        });
      }
      that.data.existfiles= existFiles;
  
    }
    this.uploadFile = function(){

      console.log('upload folder: '+that.data.elementID);
      $("input[name='fileName']" ).click();
        
      
    }
    this.viewFile = function(){
      var settings = new Settings();
      var viewURL = settings.getUrlView();
      window.open(viewURL+'?path='+that.data.elementID+'&key=&study=_ID');

    }
    this.downloadFile = function(count){

        var settings = new Settings();
        var downloadURL = settings.getUrlDownload();
        var url = downloadURL+'?path='+that.data.elementID+'&key=&study=_ID';
        var time = new Date().getTime();
        var hiddenIFrameID = 'hiddenDownloader' +time+count;
        var iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.src = url;
        iframe.load = function(){
           iframe.remove();
        }
    }


    this.newFolder = function(){
      $('#createFolderModal').modal('show');

    }
    this.deleteFolder = function(){
        
        that.api.deleteFolder(that.data.elementID,'','_ID',that.updateView);
    }
    this.deleteFile = function(e){
        
        that.api.deleteFile(that.data.elementID,'','_ID',that.updateView);
    }
		this.updateView = function(data){
      debugger;
			console.log(data);
			$('#'+that.id).html('');
      var dataObj;
      if (typeof data =='object'){
        dataObj = data;
      }else{
        dataObj = jQuery.parseJSON( data );
      }
			fileObj = dataObj.filesys;
      that.topPath = fileObj.toppath;
	    $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
	    that.createRaws(fileObj);

		}
		this.createTable = function(id){
	        
          $('#'+that.id).append('<table id="fileTabale" class="table table-striped table-hover"><thead><th></th><th></th></thead><tbody id="body"></tbody></table>');
          var html= '<tr>'+
              '<td id="'+id+'">'+
                '<span style="margin-left:0px;">';
          if (that.level!=0 || that.data.role==='SU'){
          	html=html+'<i id="drillUp" class="fa fa-level-up" style="cursor:pointer"></i>';
		      }      
		      html=html+'<span class="folder" ></span></span>'+
	              '</td>'+
	              '<td>'+
	                '<button type="button" id="uploadFile" class="btn btn-primary btn-xs">Upload File</button>'+
	                '<button type="button" style="margin-left:20px;" id="newFolder" class="btn btn-primary btn-xs">Create New Folder</button>'+
	                '<button type="button" style="margin-left:20px;" id="multiple" class="btn btn-primary btn-xs">Multiple Download</button>'+
	                '<button type="button" style="margin-left:20px;" id="multipleDelete" class="btn btn-primary btn-xs">Multiple Delete</button>'+
	              '</td>'+    
	            '</tr>';
	          $('#fileTabale > tbody').append(html);
        
      	}
		// this.createUserButtons = function(){
	 //        var user = model.user;
	 //        var role = user.role;
	 //        if (that.data.role==='SU'){
	 //          if (model.study==='all' || model.study==='user'){
	 //            $('#'+this.id).append('<div><button class="btn btn-success btn-sm" type="button" id="userFolder" type="button">User</button>'+
	 //            '<button class="btn btn-success btn-sm" type="button" id="personalFolder" type="button" style="margin-left:10px;">Personal</button></div>');
	 //          }
	  
	 //        }
  //     	}
      	this.getStudyTestlHtml = function(){
        	var html='<div class="dropdown" style="display: inline">'+
                    '<button type="button" id="dropdownTest" style="margin-left:20px;" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-expanded="true">'+
                      'Study Tester'+
                      '<span class="caret"></span>'+
                    '</button>'+
                    '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownTest">'+
                      '<li><a class="testStudy nohref">Run Study</a></li>'+
                      '<li><a  class="copyLink nohref">Copy link</a></li>'+
                    '</ul>'+
                  '</div>';
        	return html;

      	}
      	this.addExptRaw = function(name,level,id){
        	
	        var html = '<tr>'+
	          '<td class="file" id="'+id+'" >'+
	            '<span class="fileNameSpan" style="margin-left:'+level*50+'px" ><input type="checkbox" class="check" style="margin-right:10px;">'+
	              '<i class="fa fa-file-text" ></i> '+name+
	            '</span>'+
	          '</td>'+
	          '<td>'+
	              '<button type="button" class="btn btn-primary btn-xs Svalidate">Run study validator</button>'+that.getStudyTestlHtml()+
	              '<!--<button type="button" style="margin-left:20px;" class="btn btn-primary btn-xs testStudy">Test the study</button>'+
	              '<button type="button" style="margin-left:20px;" class="btn btn-primary btn-xs runData">Run data tester</button>-->'+
	              '<button type="button" id="viewFile" style="margin-left:20px;" class="btn btn-primary btn-xs">View File</button>'+
	              '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
	              '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
	              '<!--<button type="button" id="deployButton" style="margin-left:20px;" class="btn btn-primary btn-xs">Deploy</button>'+
	              '<button type="button" style="margin-left:20px;" id="statisticsButton" class="btn btn-primary btn-xs ">Statistics</button>'+
	              '<button type="button" style="margin-left:20px;" id="dataFile" class="btn btn-primary btn-xs ">Data</button>-->'+
	            '</td>'+
	          '</tr>';
	          
	          
        	$('#fileTabale > tbody').append(html);
      }
      this.addJspRaw = function(name,level,id){

        
        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+id+'" >'+
            '<span class="fileNameSpan" style="margin-left:'+level*50+'px"><input type="checkbox" class="check" style="margin-right:10px;"><i class="fa fa-file-text" >'+
            '</i> '+name+
            '</span>'+
          '</td>'+
          '<td>'+
                '<button type="button" id="viewFile" class="btn btn-primary btn-xs">View File</button>'+
                '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
                '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
          '</td>'+
        '</tr>');
      }

      this.addJSRaw = function(name,level,id){

        
        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+id+'">'+
            '<span class="fileNameSpan" style="margin-left:'+level*50+'px"> <input type="checkbox" class="check" style="margin-right:10px;">'+
              '<i class="fa fa-file-text" ></i> '+name+
            '</span>'+
          '</td>'+
          '<td>'+
            '<button type="button" class="btn btn-primary btn-xs validate">Check js syntax</button>'+
            '<button type="button" id="viewFile" style="margin-left:20px;" class="btn btn-primary btn-xs">View File</button>'+
            '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
            '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+     
           '</td>'+
        '</tr>');

      }    
      this.addFileRaw = function(name,level,id){

        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+id+'" >'+
            '<span class="fileRaw fileNameSpan" style="margin-left:'+level*50+'px"><input type="checkbox" class="check" style="margin-right:10px;">'+
              '<i class="fa fa-file-text"  ></i> '+name+
            '</span>'+
          '</td>'+
          '<td>'+
                '<button type="button" id="viewFile" class="btn btn-primary btn-xs">View File</button>'+
                '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
                '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
          '</td>'+
        '</tr>');
      }
      this.addFolderRaw = function(name,level,id){

        
        $('#fileTabale > tbody').append('<tr>'+
            '<td id="'+id+'" >'+
              '<span  style="margin-left:'+level*50+'px"><input type="checkbox" class="check" style="margin-right:10px;">'+
                '<span class="folder" style="cursor:pointer"><i class="fa fa-folder" ></i> <span id="folderNameR">'+name+'</span></span>'+
              '</span>'+
            '</td>'+
            '<td>'+
                '<!--<button type="button" id="uploadFile" class="btn btn-primary btn-xs">Upload File</button>'+
                '<button type="button" style="margin-left:20px;" id="newFolder" class="btn btn-primary btn-xs">Create New Folder</button>-->'+
                '<button type="button" id="deleteFolder" class="btn btn-primary btn-xs ">Delete Folder</button>'+
                '<button type="button" style="margin-left:20px;" id="downloadFolder" class="btn btn-primary btn-xs ">Download Folder</button>'+
                '<button type="button" style="margin-left:20px;" id="renameFolder" class="btn btn-primary btn-xs ">Rename Folder</button>'+

            '</td>'+
          '</tr>');

      }
      this.addEmptyRaw = function(level){
        
        $('#fileTabale > tbody').append('<tr>'+
            '<td class="" id="" >'+
              '<span class="folderup" style="margin-left:'+level*50+'px;"><i class="fa fa-level-up"></i>'+
              '</span>'+
            '</td>'+
            '<td>'+
            '</td>'+
          '</tr>');

      }
      this.setToPath = function(){
        $('#'+that.id).append('<div>'+that.topPath+'</div>');
      }
  	  this.createRaws = function(fileObj){
  	  	this.createDandD();
        this.setToPath();
        this.createTable(fileObj.current.id);
        

        for (var key in fileObj) {
          if (fileObj.hasOwnProperty(key)) {
              var value = fileObj[key];
              if (value.type==='folder'){
                that.addFolderRaw(value.name,0,value.id);
              }
              if (value.type==='file'){
                that.addFile(value.name,0,value.id);
              }
          }
        }
      

	  	// $.each(fileObj, function(key, value){
	  	// 	console.log(key);
	  	// 	if (value.type==='folder'){
  		// 		that.addFolderRaw(value.name,0,value.id);

  		// 	}
  		// 	if (value.type==='file'){
  		// 		that.addFile(value.name,0,value.id);

  		// 	}
	  	// });
   	
	  }
    // this.setModals = function(){
    //     var existFiles = that.data.exist;
    //     var info = that.data.Modalinfo;
        
    //     if (info.index >= existFiles.length){
    //         that.data.done=true;
    //         console.log('done');
    //         return;
    //       }
    //     var participant = existFiles[info.index];
    //     console.log(participant.key);
    //     $('#overwriteFileName').text('A file with the name '+participant.key+' already exist, overwrite?');
    //     $('#uploadedModal').modal('hide');
    //     $('#overwrite').modal('show');


    // }
	  this.addFile = function(name,level,id){
	  	var array = name.split('.');
	  	if (array[1]==='jsp'){
	        that.addJspRaw(name,level,id);
	        return;
	    }
	    if (array[1]==='expt'){
	    	that.addExptRaw(name,level,id);
	    	return;
	    }
	    if (array[1]==='js'){
	    	that.addJSRaw(name,level,id);
	    	return;
	    }
	    that.addFileRaw(name,level,id);
	  	

	  }
	  this.DrophandleFileUpload = function(files,obj){

      
      var data =new FormData();
      that.updateDatawithFiles(files,data,cmd,folderpath);
      //if (model.activePage === 'file') model.study='all';
      that.createExistFilesArray(event.target.files,data);
      var exist = that.data.existfiles;
      if (exist.length>0){
        $('#overwrite').modal('show');
      }else{

        data.append('study','_CURRENT');
        data.append('cmd','UploadFile');
        that.api.uploadFile(data,that.updateView);

      }

    }

    this.updateDatawithFiles = function(files,data,cmd){

      if (   (navigator.userAgent).indexOf('Mozilla')!=-1    ) {
        $.each(files, function(key, value){
          data.append(key, value);
        });
      }else{
        for (var i=0;i<files.length;i++){
          var item = files[i];
          var entry = item.webkitGetAsEntry();
          if (entry.isFile){
             var file = item.getAsFile();
             data.append(i, file);
          }else{ 
            if (entry.isDirectory){
       
            }
          }
    
        }       
      }

  
    }
  	this.createDandD = function(){
  		$('#'+this.id).append('<div id="dragandrophandler">Drag & Drop Files Here</div>');
      var obj = $("#dragandrophandler");
      obj.on('dragenter', function (e) 
      {
          e.stopPropagation();
          e.preventDefault();
          $(this).css('border', '2px solid #0B85A1');
      });
      obj.on('dragover', function (e) 
      {
           e.stopPropagation();
           e.preventDefault();
      });
      obj.on('drop', function (e) 
      {
       
           $(this).css('border', '2px dotted #0B85A1');
           e.preventDefault();
           var filesI = e.originalEvent.dataTransfer.files;
           var files = e.originalEvent.dataTransfer.items;
           //var length = e.originalEvent.dataTransfer.items.length;
           //We need to send dropped files to Server
           //$('#uploadedModal').modal('show');
           if (   (navigator.userAgent).indexOf('Mozilla')!=-1    ) {
            that.DrophandleFileUpload(filesI,obj);

           }else{
            that.DrophandleFileUpload(files,obj);
           }
           
      });
  	}


	};

	return fileComposer;


});