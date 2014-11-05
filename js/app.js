
    require.config({
    paths: {
        'jQuery': '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min',
        'bootstrap': '//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min',
        'jshint': 'jshint',
        'csvToTable':'jquery.csvToTable',
        'tablesorter':'tablesorter/jquery.tablesorter',
        'datepicker':'datepicker/js/bootstrap-datepicker',
        'chart': 'chart',
        //'jui':'//ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui',
        'context':'Contextmaster/context',
        'knobmin':'knobmin'
        

    },
    waitSeconds: 25,
    shim: {
        'jQuery': {
            exports: '$'
        },
        'bootstrap' : ['jQuery'],
        'csvToTable': ['jQuery'],
        'tablesorter':['jQuery'],
        'datepicker': ['jQuery','bootstrap'],
        'jshint':['jQuery'],
        'context':['jQuery'],
        'chart':['jQuery'],
        'knobmin':['jQuery']
        
        
    }
});
require(['domReady','api','jQuery','tracker','chart','settings','fileSys','deploy','file','bootstrap','jshint','csvToTable',
  'tablesorter','context'],
 function (domReady,API,$,Tracker,ChartFX,Settings,Filesys,Deploy,FileSys) {
 
    // do something with the loaded modules
  domReady(function () {
      
      var model={};
      var api = new API();
      $('#studyModel').modal('show');
      api.init(model,setStudies,SetUser);
      
      var id=0;
      var fileTableModel ={};
      fileTableModel.user=false;
      var fileObj;
      context.init({preventDoubleContext: false},model);
      setLiseners();
      // context.attach('.folder', [
      //   {header: 'Options'},
      //   {text: 'Upload File', action: uploadFile},
      //   {text: 'Create New Folder', action: newFolder},
      //   {text: 'Delete Folder', action: deleteFolder}
        
      // ]);
      // context.attach('.file', [
      //   {header: 'Options'},
      //   {text: 'View File', action: viewFile},
      //   {text: 'Download File', action: downloadFile},
      //   {text: 'Delete File', action: deleteFile}
      
        
      // ]);

      //$(document).find('input[type=file]').on('change', prepareUpload);
      $(document).find('input[type=file]').on('click',function(){
        this.value = null;

      })
      
      $(document).find('input[type=file]').bind("change", function () {
           var file = this.files[0];
           if (file) {
               // if file selected, do something
               $('#uploadedModal').modal('show');
               prepareUpload();
          } else {
              // if user clicks 'Cancel', do something
          }
      });

      
      $(document).on("click",'#createFolderOK', function(){
        var pathA = new Array();
        var path='';
        var study;
        var info = {};
        info.found = false;
        $('#uploadedModal').modal('show');
        var folderToCreate = $('#folderName').val();
        $('#folderName').val('');
        if (model.elementID==='0'){
          path="/";
          
          if (model.study==='all' || model.study===undefined){
            study='all';
            model.tempFolder = takespaces(folderToCreate)+'/';
          }else{
            model.tempFolder=model.study+'/'+takespaces(folderToCreate)+'/';
            study=model.study;
          }
          
          
        }else{// if the folder is not a root folder
          getPath(model.fileSystem,model.elementID,pathA,info);
          for (var i=0;i<pathA.length;i++){
            path+=pathA[i]+'/';
          }
          study='all';
          model.tempFolder = path+takespaces(folderToCreate)+'/';
          
          
          
        }
       
        //if (model.activePage === 'file') model.study='all';
        api.createFolder(model.key,takespaces(path),takespaces(folderToCreate),study,folderCreated);

      });
      
      function getStudyPath(study){
        var study = findStudy(study);
        var folder = study.folder;
        var user = model.user;
        var found=false;
        var res='';
        var splitArray = folder.split('\\');
        for(var i=0;i<splitArray.length;i++){
          if (found){
            res=res+splitArray[i]+'/';
          }
          if (splitArray[i]===user.folder){
            found=true;
          }
        }
        return res;
      }
      function setModals(existFiles,i,model,data,study,path){
        if (i >= existFiles.length){
            model.done=true;
            return;
          }
        var participant = existFiles[i];
        $('#overwriteFileName').text('A file with the name '+participant.key+' already exist, overwrite?');
        $('#overwrite').modal('show');
        var modal = $('#overwrite');
        $('#FileoverwriteYes').on('click',function(e){
           var all = $('#applytoall').prop('checked');
           var fileText = $('#overwriteFileName').text();
           var words = fileText.split(' ');
           var name = words[5];
           var existFiles = model.exist;
           for (var x=0;x<existFiles.length;x++){
             var file  = existFiles[x];
             if (file.key===name){
               file.overwrite=true;
             }
           }

          $('#overwrite').modal('hide');
          setModals(existFiles,i + 1,model,data,study,path);
          if (model.done===true){
            if (model.all===true){
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
            if (model.activePage === 'file') model.study='all';
            data.append('UserKey',model.key);
            data.append('folder',takespaces(path));
            data.append('study',study);
            data.append('cmd','UploadFile');
            
            api.uploadFile(data,fileOpSuccess);
          }
        })
        // modal.on('hidden.bs.modal', function (e) {
         
        // })
        

      }
      function prepareUpload(){
        
        var data =new FormData();
        var pathA = new Array();
        var study;
        var info={};
        info.found=false;
        var path='';
        if (model.elementID==='0'){//if root
          path="/";
          study=model.study;
          if (study===undefined) study='all';
        }else{// not root using all method
          getPath(model.fileSystem,model.elementID,pathA,info);
          for (var i=0;i<pathA.length;i++){
            path+=pathA[i]+'/';
          }
          study='all';
        }
        var existFiles = new Array();
        
        $.each(event.target.files, function(key, value){
            console.log(key);
            console.log(value);
          //data.append(key, value);
            var res= api.fileExist(key,model.key,takespaces(path),study,value.name);
            if (res){
              var file={};
              file.key =value.name;
              file.formkey = key;
              file.formvalue = value;
              existFiles.push(file);
            }else{
              data.append(key, value);
            }
        });
        model.exist = existFiles;
        if (existFiles.length>0){
          setModals(existFiles,0,model,data,study,path);
        }else{
          if (model.activePage === 'file') model.study='all';
          data.append('UserKey',model.key);
          data.append('folder',takespaces(path));
          data.append('study',study);
          data.append('cmd','UploadFile');
          
          api.uploadFile(data,fileOpSuccess);

        }
        
        // for (var i=0;i<existFiles.length;i++){
        //   var file = existFiles[i];
        //   $('#overwriteFileName').text('A file with the name '+file.key+' already exist, overwrite?');
        //   $('#overwrite').modal('show');
        //   if (model.all===true){
        //      break;
        //   }
        // }
        // if (model.done===true){
        //   if (model.all===true){
        //   for (var i=0;i<existFiles.length;i++){
        //     var file = existFiles[i];
        //     data.append(file.key, file.val);
        //   }
        //   }else{
        //     for (var i=0;i<existFiles.length;i++){
        //       var file = existFiles[i];
        //       if (file.overwrite=true){
        //         data.append(file.key, file.val);  
        //       }
        //     }
        //   }
        //   if (model.activePage === 'file') model.study='all';
        //   data.append('UserKey',model.key);
        //   data.append('folder',takespaces(path));
        //   data.append('study',study);
        //   data.append('cmd','UploadFile');
          
        //   api.uploadFile(data,fileOpSuccess);

        // }
        
       
      }

      function getStudyFromFileSys(fileSystem,info){
        
        $.each(fileSystem, function(k, v) {
          if (k.indexOf(".")===-1&& k!='id'&&k!='state'){//if folder
            if (k===info.study){
              info.studyObj=v;
              return false;
            }else{
              getStudyFromFileSys(v,info);
            }
          }
        });


      }
      $(document).on('click','#FileoverwriteYes',function(){
        // var all = $('#applytoall').prop('checked');
        // var fileText = $('#overwriteFileName').text();
        // var words = fileText.split(' ');
        // var name = words[5];
        // var existFiles = model.exist;
        // for (var i=0;i<existFiles.length;i++){
        //   var file  = existFiles[i];
        //   if (file.key===name){
        //     file.overwrite=true;
        //   }
        // }

        // $('#overwrite').modal('hide');
      });
      
      $(document).on('click','#multiple', function(){
       
        $( '.check' ).each(function( index ) {
          var input = $(this);
          var tr  = $(input).parent().parent();
          var id = $(tr).attr("id");
          if (id===undefined){
            var upTD = $(tr).find('.file');
            id = $(upTD).attr("id");
          }
          
          //var id = $(tr).attr("id");
          if ($(input).prop('checked')){
            
            model.elementID = id;
            downloadFile();
            $(this).attr('checked', false);

          }
        });
      });

      $(document).on('click','#uploadFile', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.folder').parent().parent();
        var id = $(td).attr("id");
        model.elementID = id;
        uploadFile();


      });
      $(document).on('click','#newFolder', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.folder').parent().parent();
        var id = $(td).attr("id");
        model.elementID = id;
        newFolder();

      });
      $(document).on('click','#deleteFolder', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.folder').parent().parent();
        var id = $(td).attr("id");
        model.elementID = id;
        model.deleteAction='folder';
        $('#deleteModal').modal('show');
        

      });

      $(document).on('click','#viewFile', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.file');
        var id = $(td).attr("id");
        model.elementID = id;
        viewFile();

      });
      $(document).on('click','#downloadFile', function(){
        var element =$(this);
        var td = $(element).parent();
        var tr = $(td).parent();
        var upTD = $(tr).find('.file');
        var id = $(upTD).attr("id");
        model.elementID = id;
        downloadFile();

      });
      $(document).on('click','#deleteFile', function(){
        var element =$(this);
        var tr = $(element).parent().parent();
        var td = $(tr).find('.file');
        var id = $(td).attr("id");
        model.elementID = id;
        $('#deleteModal').modal('show');
        

      });
      
      $(document).on('click','#deleteOK', function(){

        if (model.deleteAction==='folder'){
          $('#uploadedModal').modal('show');
          deleteFolder();
        }else{
          $('#uploadedModal').modal('show');
          deleteFile();
        }
        

      });
      $(document).on('click','#newStudy', function(){
        $('#NewStudyModal').modal('show');

      });
      $(document).on('click','#newStudyOK',function(){

        var studyName = $('#studyName').val();
        $('#studyName').val('');
        model.study=studyName;
        $('#uploadedModal').modal('show');
        api.newStudy(takespaces(studyName),model.key,function(){
          var studies = model.studyNames;
          var user = model.user;
          var studyname = model.study;
          studies[studyname] = {name:studyname,exptID:'not_set',folder:user.folder+"/"+studyname};
          setStudies(studies);
          //model.study=studyname;
          $('#instruct').hide();
          $('#result').html('');
          $('#studyTablePanel').hide();
          $('#studyTable').hide();
          setSideMenu();
          populateFileTable();

        });
        //api.getStudies(model.key,setStudies);

      });

      $(document).on("click",'.tableVal', function(){

        console.log($(this).text());
        model.study = $(this).text();
        $('.studyButt').html(model.study+'<span class="caret"></span>');
        setSideMenu();
        populateFileTable();
        
      });

      $(document).on('click','.tableRaw', function(){
        model.activePage === 'study';
        var tr =$(this);
        var chosenStudy = $(tr).find('.studyRaw').text();
        model.study= chosenStudy;
        $('#instruct').hide();
        $('#result').html('');
        //$('#studyTablePanel').html('');
        $('#studyTablePanel').hide();
        $('#studyTable').hide();
        setSideMenu();
        populateFileTable();
      });

      /**
      * Desc: main listener for the 
      * 'deploy' top menu navigetaion bar.
      *
      *
      */

      $(document).on("click",'#deployButton', function(){
        var button = $(this);
        var span = $(button).parent().parent().find('.fileNameSpan');
        var fname = takespaces($(span).text());
        model.exptFile = fname;
        $('#result').html('');
        $('#studyTable').hide();
        model.activePage = 'deploy';
        var deployObj = new Deploy(model,'design1');
        model.active = deployObj;
        deployObj.setHtml();
        


      });
      $(document).on("click",'#deploy', function(){
        $('#result').html('');
        $('#studyTable').hide();
        model.activePage = 'deploy';
        var deployObj = new Deploy(model,'design1');
        deployObj.setHtml();
        model.active = deployObj;
      });  
      
      $('#deployFile').on("click",function(){


      });
      
      $(document).on('dragenter', function (e) 
      {
          e.stopPropagation();
          e.preventDefault();
      });
      $(document).on('dragover', function (e) 
      {
        e.stopPropagation();
        e.preventDefault();
        //obj.css('border', '2px dotted #0B85A1');
      });
      $(document).on('drop', function (e) 
      {
          e.stopPropagation();
          e.preventDefault();
      });

      /**
      * Desc: main listener for the 
      * 'rde' top menu navigetaion bar.
      *
      *
      */

      $(document).on("click",'#rde', function(){
        $('#result').html('');
        model.activePage = 'rde';
        model.active='';

      });

      /**
      * Desc: main listener for the 
      * 'home' top menu navigetaion bar.
      *
      */  

      $(document).on("click",'#home', function(){
        $('#result').html('');
        model.activePage = 'home';
        var menu = $('#sideMenu');
        menu.html( '</br>'+
                     '<strong>My Studies </strong>'+
                     '<div class="dropdown" style="display: inline">'+
                          '<button class="btn btn-default dropdown-toggle btn-sm studyButt" type="button" id="dropdownMenu1" data-toggle="dropdown">'+
                            'Studies '+
                            '<span class="caret"></span>'+
                          '</button>'+
                          '<ul class="dropdown-menu dropdownLI" role="menu" aria-labelledby="dropdownMenu1">'+
                          '</ul>'+
                    '</div>'+
                    '<hr>'+
                    '<li class="active"><a href="#" id="home"><i class="fa fa-bullseye"></i> Home</a></li>'+
                    '<li><a href="#" id="fileSys"><i class="fa fa-tasks" ></i> File System</a></li>'+                    
                    '<li><a href="#" id="newStudy"><i class="fa fa-globe"></i> Create Study</a></li>'
                  );
        $.each(model.studyNames, function(key, value) {
            $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">'+key+'</a></li>');
        });
        setLiseners();
        $('#studyTablePanel').show();
        $('#studyTable').show();

      }); 



      
      $(document).on("click",'#fileSys', function(){
        $('#uploadedModal').modal('show');
        $('#studyTablePanel').hide();
        $('#instruct').css("display","none");
        $('#result').html('');
        $('#studyTable').hide();
        model.activePage = 'file';
        model.active='';
        model.study='all';
        api.getFiles(model.key,model.study,setStudyTable);

      });
      /**
      * Desc: main listener for the 
      * 'test' top menu navigetaion bar.
      *
      */ 

      $(document).on("click",'#test', function(){
        $('#uploadedModal').modal('show');
        $('#result').html('');
        $('#studyTable').hide();
        model.activePage = 'test';
        model.active='';
        var study = model.study;
        if (study===null || study===undefined) study='all';
        //api.getFiles(model.key,study,setStudyTable);
        api.getFiles(model.key,'all',function(data){
          $('#uploadedModal').modal('hide');
          fileObj = jQuery.parseJSON( data );
          createTable();
          var index ={};
          index.index=0;
          setIds(fileObj,index);
          model.openStruct={};
          model.fileSystem = fileObj;
          setOpenStruct(fileObj,model.openStruct);
          fileTableModel.user = false;
          //$('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
          var info={};
          info.study=model.study;
          getStudyFromFileSys(fileObj,info);
          model.studyFileSystem=info.studyObj;

          createRaws(info.studyObj,false,fileTableModel.user);

        });


      });

      

      /**
      * Desc: main listener for the 
      * 'file system' top menu navigetaion bar.
      *
      */  

      // $(document).on("click",'#fileSys', function(){
      //   $('#uploadedModal').modal('show');
      //   $('#result').html('');
      //   fileTableModel.user=true;
      //   model.active='';
      //   model.activePage = 'file';
      //   var study = model.study;
      //   //var fs = new Filesys(model,fileTableModel);
      //   //fs.setFileSysTable('all');

      //   api.getFiles(model.key,'all',setUserFileTable);
      //   $('#studyTable').hide();
        

      // });
      $(document).on("click",'.testStudy',function(){
         console.log($(this));
         //debugger;
         var button = $(this);
         var span = $(button).parent().parent().find('.fileNameSpan');
         console.log(span);
         var fname = takespaces($(span).text());
         api.getUser(takespaces(model.key),function(data){
           var userObj = jQuery.parseJSON( data );
           var user = userObj.folder;
           var studyName = model.study;
           studyName = takeOutBraclet(studyName);
           window.open("https://dw2.psyc.virginia.edu/implicit/Launch?study=/user/"+user+"/"+studyName+"/"+fname+"&refresh=true");


         });
      });
      $(document).on("click",'.Svalidate',function(){
         console.log($(this));
         //debugger;
         var button = $(this);
         var span = $(button).parent().parent().find('.fileNameSpan');
         console.log(span);
         var fname = $(span).text();
         api.Studyvalidate(model.key,model.study,takespaces(fname),openStudyValidation);

      });
      $(document).on("click",'.validate',function(){
         console.log($(this));
         //debugger;
         var button = $(this);
         var span = $(button).parent().parent().find('.fileNameSpan');
         console.log(span);
         var fname = $(span).text();
         api.validateFile(model.key,model.study,takespaces(fname),openValidation);

      });
      
      /**
      * Desc: Listener for pressing a folder
      * in the file system
      * 
      *
      */

      $(document).on("click",'.folder',function(){
        console.log($(this));
        //debugger;
        var td = $(this).parent().parent();
        var tr = $(td).parent();
        var folderName = $(tr).text();
        var id = $(td).attr("id");
        changeFolderState(takespaces(folderName),id);
        createRaws(model.studyFileSystem,false,fileTableModel.user);
                   
        //createRawsWButt(fileObj,false);
      });

      $(document).on("click",'.test',function(){
        //$('#result').html('');
        //$('#studyTable').hide();
        model.activePage = 'test';     
        fileTableModel.user=true;
        console.log($(this));
        var button = $(this);
        var anchor = $(button).parent().parent().find('a');
        model.study = $(anchor).text();
        $('.studyButt').text(model.study);
        $('#test').click();
        //console.log(model.key);
        //api.getFiles(model.key,model.study,setStudyTable);


      });
      $(document).on('click','#statsFile',function(){
        $('#result').html('');
        $('#studyTable').hide();
        model.activePage = 'trackmenu';
        var studyExpt;
        if (model.study!=undefined){
          var exptName = $(this).parent().parent().text();
          var study = model.study+"("+exptName+")";
          studyExpt = getExptid(study);
          if (studyExpt==='not_set'){
            api.getExpt(model.key,model.study,function(data){
              studyExpt = data;
              appendTracker(studyExpt);
            })
          }else{
            appendTracker(studyExpt);
          }
          
        }else{
          api.getUserName(takespaces(model.key),function(data){
          appendTracker(data);
           
          });
        }


      });
      $(document).on("click",'#trackmenu', function(){
        $('#result').html('');
        $('#studyTable').hide();
        model.activePage = 'trackmenu';
        var studyExpt;
        if (model.study!=undefined){
          studyExpt = getExptid(model.study);
          if (studyExpt==='not_set'){
            api.getExpt(model.key,model.study,function(data){
              studyExpt = data;
              appendTracker(studyExpt);
            })
          }else{
            appendTracker(studyExpt);
          }
          
        }else{
          api.getUserName(takespaces(model.key),function(data){
          appendTracker(data);
           
          });
        }
      });
      $(document).on("click",'#statisticsButton',function(){

        $('#result').html('');
        $('#studyTable').hide();
        var button = $(this);
        var span = $(button).parent().parent().find('.fileNameSpan');
        var fname = takespaces($(span).text());
        model.exptFile = fname;
        model.activePage = 'trackmenu';
        var study = findStudy(model.study);
        var exptID = getEXPTIDFromStudy(fname,study);
        var studyExpt=[];
        studyExpt[0]=exptID;
        if (model.study!=undefined){
          if (studyExpt==='not_set'){
            api.getExpt(model.key,model.study,function(data){
              studyExpt = data;
              appendTracker(studyExpt);
            })
          }else{
            appendTracker(studyExpt);
          }
          
        }else{
          api.getUserName(takespaces(model.key),function(data){
          appendTracker(data);
           
          });
        }

      });

      $(document).on("click",'.statistics',function(){

        var button = $(this);
        var anchor = $(button).parent().parent().find('a');
        var study = $(anchor).text();
        setChartData(study);
        

      });
      // $("input[name='fileName']" ).change(function () {
      //     $('#upload').click();
      // });
///////////////////////////fUNCTIONS////////////////////////////////////

      function setLiseners(){
        $('#sideMenu li').click(function(e) {
          //alert('inside hover');
          $('#sideMenu li.active').removeClass('active');
          var $this = $(this);
          if (!$this.hasClass('active')) {
              $this.addClass('active');
          }
          e.preventDefault();
        });
      }

      function setSideMenu(){
        var menu = $('#sideMenu');
        menu.html(  '</br>'+
                     '<strong>My Studies </strong>'+
                     '<div class="dropdown" style="display: inline">'+
                          '<button class="btn btn-default dropdown-toggle btn-sm studyButt" type="button" id="dropdownMenu1" data-toggle="dropdown">'+
                            'Studies '+
                            '<span class="caret"></span>'+
                          '</button>'+
                          '<ul class="dropdown-menu dropdownLI" role="menu" aria-labelledby="dropdownMenu1">'+
                          '</ul>'+
                    '</div>'+
                    '<hr>'+
                    '<li ><a href="#" id="home"><i class="fa fa-bullseye"></i> Home</a></li>'+
                    '<li class="active"><a href="#" id="test"><i class="fa fa-tasks" ></i> Manage Study </a></li>'+
                    '<li><a href="#" id="trackmenu"><i class="fa fa-tasks" ></i> Statistics </a></li>'+
                    '<li><a href="#" id="fileSys"><i class="fa fa-tasks" ></i> Data </a></li>'+                    
                    '<li><a href="#" id="deploy"><i class="fa fa-tasks" ></i> Deploy </a></li>'+
                    '<li><a href="#" id="newStudy"><i class="fa fa-globe"></i> Create Study</a></li>'
                  );
        
        $.each(model.studyNames, function(key, value) {
            $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">'+key+'</a></li>');
        });
        $('.studyButt').html(model.study+'<span class="caret"></span>');
        setLiseners();
      }

      function getEXPTIDFromStudy(EXPTFile,study){
        var num;
        var id;
        $.each(study,function(k,v){
          if (v.indexOf(EXPTFile)!=-1){
            var numArray = k.split(".");
            num = numArray[1];
            return false;
          }
        })
        $.each(study,function(k,v){
          if (k.indexOf('exptID')!=-1 && k.indexOf(num)!=-1){
            id=v;
            
          }
        })
        return id;
      }

      function deleteFolder(){
        var pathA = new Array();
        var path='';
        var info = {};
        info.found = false;
        getPath(model.fileSystem,model.elementID,pathA,info);
        for (var i=0;i<pathA.length;i++){
          path+=pathA[i]+'/';
        }
        if (model.activePage === 'file') model.study='all';
        api.deleteFolder(path,model.key,'all',fileOpSuccess);
      }
      function deleteSuccess(){
        //alert('folder deleted');
        $('#fileSys').click();
      }

      function populateFileTable(){
        $('#uploadedModal').modal('show');
        $('#result').html('');
        $('#studyTablePanel').hide();
        $('#studyTable').hide();
        model.activePage = 'test';
        model.active='';
        // if (model.study!='all'){
        //   var filesystem  = new FileSys(model);
        //   api.getFiles(model.key,model.study,function(data){
        //     $('#uploadedModal').modal('hide');
        //     fileObj = jQuery.parseJSON( data );
        //     model.openStruct={};
        //     model.fileSystem = fileObj;
        //     var index ={};
        //     index.index=0;
        //     filesystem.setIds(model.fileSystem,index);
        //     filesystem.setOpenStruct(model.fileSystem);
        //     fileTableModel.user = false;
        //     createRaws(model.fileSystem,false,fileTableModel.user);

        //   });

        // }else{
          api.getFiles(model.key,'all',function(data){
            $('#uploadedModal').modal('hide');
            fileObj = jQuery.parseJSON( data );
            //createTable();
            var index ={};
            index.index=0;
            setIds(fileObj,index);
            model.openStruct={};
            model.fileSystem = fileObj;
            setOpenStruct(fileObj,model.openStruct);
            fileTableModel.user = false;
            var info={};
            info.study=model.study;
            getStudyFromFileSys(fileObj,info);
            model.studyFileSystem=info.studyObj;
            createRaws(info.studyObj,false,fileTableModel.user);

          });

       // }
        


      }

      function newStudySuccess(studyname){
        //alert('study was created');
        var studies = model.studyNames;
        var user = model.user;
        studies[studyname] = {name:studyname,exptID:'not_set',folder:user.folder+"/"+studyname};
        //studies.push({name:studyname,exptID:'not_set'});
        setStudies(studies);
        model.study=studyname;
        $('#instruct').hide();
        $('#result').html('');
        //$('#studyTablePanel').html('');
        $('#studyTablePanel').hide();
        $('#studyTable').hide();
        setSideMenu();
        populateFileTable();
      }

      function folderCreated(){
        //alert('folder created');
        //$('#fileSys').click();
        var open =model.openStruct;
        open[model.tempFolder] = 'close';  
        
        //model.activePage = 'test';
        model.active='';
        var study = model.study;
        if (study===null || study===undefined) study='all';
        api.getFiles(model.key,'all',function(data){

          $('#uploadedModal').modal('hide');
          $('#result').html('');
          $('#studyTablePanel').hide();
          $('#studyTable').hide();
          fileObj = jQuery.parseJSON( data );
          createTable();
          var index ={};
          index.index=0;
          setIds(fileObj,index);
          model.fileSystem = fileObj;
          model.studyFileSystem = fileObj;
         // model.openStruct={};
          //setOpenStruct(fileObj,model.openStruct);
          fileTableModel.user = false;
          if (model.activePage!='file'){
            var info={};
            info.study=model.study;
            getStudyFromFileSys(fileObj,info);
            model.studyFileSystem=info.studyObj;
            $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
            createRaws(model.studyFileSystem,false,fileTableModel.user);
          }else{
            $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
            createRaws(fileObj,false,fileTableModel.user);

          }
          

        });
      }
      
      function folderID(fileSystem){
        var res;
        $.each(fileSystem, function(k, v) {
          if (k==='id'){
            res=v;
            return false;
          }
        });
        return res;
      }
      function findElement(fileSystem,elementID,info){
        
        $.each(fileSystem, function(k, v) {
               if (info.found) return false; 
               var extension = k.split(".");
               if (extension.length>1){
                 if (v.id===elementID){
                  info.folder = k;
                  info.found=true;
                  return false;
                 }
               }else{
                 if (k!='state' && k!='id'){
                   if (folderID(v)===elementID){
                    info.found=true;
                    info.folder = v;
                    return false;
                   }else{
                    findElement(v,elementID,info);
                    
                   }
                   
                 }
               }
             
          });
        
      }
      /**
      * Desc: using file or folder id
      * get the path of thar file/folder
      * return an array of path elements.
      *
      */
      function getPath(fileSystem,elementID,pathA,info){
        
          $.each(fileSystem, function(k, v) {
               if (info.found) return false; 
               var extension = k.split(".");
               if (extension.length>1){
                 if (v.id===elementID){
                  if (!info.found) pathA.push(k);
                  info.found=true;
                  return false;
                 }
               }else{
                 if (k!='state' && k!='id'){
                   if (!info.found) pathA.push(k);
                   if (folderID(v)===elementID){
                    info.found=true;
                    return false;
                   }else{
                    getPath(v,elementID,pathA,info);
                    if (!info.found) pathA.pop();

                   }
                   
                 }
               }
             
          });
        
       
      }
      /**
      * Desc: Get the path to file or folder
      * 
      * 
      *
      */
      function getPathToFile(){
        var pathA = new Array();
        var path='';
        var info = {};
        info.found = false;
        getPath(model.fileSystem,model.elementID,pathA,info);
        for (var i=0;i<pathA.length;i++){
          path+=pathA[i]+'/';
        }
        return path;
      }

      function deleteFile(e){
        var path = getPathToFile();
        if (model.activePage === 'file') model.study='all';
        api.deleteFile(path,model.key,model.study,fileOpSuccess);
      }


      function viewFile(e){
        var path = getPathToFile();
        if (model.activePage === 'file') model.study='all';
        window.open('/implicit/dashboard/view/?path='+path+'&key='+model.key+'&study=all');
        //window.open('/implicit/dashboard/view/?path='+path+'&key='+model.key);
      }

      function downloadFile(count){
        var pathA = new Array();
        var path='';
        var info = {};
        info.found = false;
        var study;
        getPath(model.fileSystem,model.elementID,pathA,info);
        for (var i=0;i<pathA.length;i++){
          path+=pathA[i]+'/';
        }
        if (model.activePage === 'file') model.study='all';
        //window.location.href = '/implicit/dashboard/download/?path='+path+'&key='+model.key+'&study=all';
        var url = '/implicit/dashboard/download/?path='+path+'&key='+model.key+'&study=all';
        var hiddenIFrameID = 'hiddenDownloader' + count++;
        var iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.src = url;
        setTimeout((function(iframe) {
           return function() { 
             iframe.remove(); 
           }
        })(iframe), 2000);
        
        
      }
      
      function downLoadSuccess(data){
        //alert('download syccesfull');
        
      }
      
       /**
      * Desc: update the file component
      * after a file operation like upload or delete.
      * 
      */

      function fileOpSuccess(data){

        
        //model.activePage = 'test';
        model.elementID = undefined;
        model.active='';
        var study = model.study;
        if (study===null || study===undefined) study='all';
        api.getFiles(model.key,'all',function(data){

          $('#uploadedModal').modal('hide');
          $('#result').html('');
          $('#studyTablePanel').hide();
          $('#studyTable').hide();
          fileObj = jQuery.parseJSON( data );
          createTable();
          var index ={};
          index.index=0;
          setIds(fileObj,index);
          model.fileSystem = fileObj;
          model.studyFileSystem = fileObj;
         // model.openStruct={};
          //setOpenStruct(fileObj,model.openStruct);
          fileTableModel.user = false;
          if (model.activePage!='file'){
            var info={};
            info.study=model.study;
            getStudyFromFileSys(fileObj,info);
            model.studyFileSystem=info.studyObj;
            $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
            createRaws(model.studyFileSystem,false,fileTableModel.user);
          }else{
            $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
            createRaws(fileObj,false,fileTableModel.user);

          }
          

        });
        
      }
      function uploadError(jqXHR, textStatus, errorThrown){
        console.log('ERRORS: ' + textStatus);

      }
      function newFolder(e){
        console.log('upload folder: '+model.elementID);
        $('#createFolderModal').modal('show');
      }
      function uploadFile(e){
        console.log('upload folder: '+model.elementID);
        $("input[name='fileName']" ).click();
        
      }
      
      function setChartData(study){
         var data = {};
         var studyExpt = getExptid(study);
         var ctx = document.getElementById("myChart").getContext("2d");
         var settings = new Settings();
         var currentdate = new Date();
         var since = new Date();
         since.setDate(since.getDate()-7);

         var sinceTxt = (since.getMonth()+1)+"/"+since.getDate()+"/"+since.getFullYear();
         var untilTxt = (currentdate.getMonth()+1)+"/"+currentdate.getDate()+"/"+currentdate.getFullYear(); 
         data.db = 'Research';
         data.testDB= "test";
         data.current = 'Any';
         data.study = studyExpt;
         //data.study = 'cebersole.ml3full';
         data.task = '';
         data.since = sinceTxt;
         data.until = untilTxt;
         data.refresh ='no';
         data.endTask='';
         data.filter = '';
         data.endTask='';
         data.studyc ='true';
         data.taskc = 'false';
         data.datac = 'false';
         data.timec = 'true';
         data.dayc = 'true';
         data.weekc = 'false';
         data.monthc = 'false';
         data.yearc = 'false';
         data.method = '3';
         data.curl= settings.getCurl();
         data.hurl= settings.getHurl();
         data.cpath='';
         data.hpath='';
         data.tasksM='3';
         data.threads = 'yes';
         data.threadsNum = '1';
         data.baseURL = settings.getBaseURL();

         api.getTracker(data,function(result){

          console.log(result);
          var resultRaws = result.replace( /\n/g, " " ).split( " " );
           // var datatry = {
           //   labels: ["January", "February", "March", "April", "May", "June", "July"],
           //   datasets: [
           //       {
           //           label: "My First dataset",
           //           fillColor: "rgba(220,220,220,0.5)",
           //           strokeColor: "rgba(220,220,220,0.8)",
           //           highlightFill: "rgba(220,220,220,0.75)",
           //           highlightStroke: "rgba(220,220,220,1)",
           //           data: [65, 59, 80, 81, 56, 55, 40]
           //       }//,
           //       // {
           //       //     label: "My Second dataset",
           //       //     fillColor: "rgba(151,187,205,0.5)",
           //       //     strokeColor: "rgba(151,187,205,0.8)",
           //       //     highlightFill: "rgba(151,187,205,0.75)",
           //       //     highlightStroke: "rgba(151,187,205,1)",
           //       //     data: [28, 48, 40, 19, 86, 27, 90]
           //       // }
           //   ]
           // };
          
          var datactx = {};
          var labels =[];
          var datasets = [{
            label: "CR%",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: []
          }];

          for (var i=1;i<resultRaws.length-2;i++){
            var raws = resultRaws[i].split(",");
            labels[i-1]=raws[1];
            var cr = raws[4];
            cr = cr.substring(0,cr.length-2);
            datasets[0].data[i-1] = cr;
            
          }

          datactx.labels = labels;
          datactx.datasets = datasets;
          var myChart = new ChartFX(ctx);
          var myBarChart = myChart.Bar(datactx);
          $('#myStats').modal('show');


         });

          
      }
      function parseline(str,a,b,c,d){
        var res = str.replace('{a}',a);
        res = res.replace('{b}',b);
        res = res.replace('{c}',c);
        res = res.replace('{d}',d);
        return res;
      }

      function SetUser(data){
        var userObj = jQuery.parseJSON( data );
        model.user = userObj;
        $('#userName').html('<i class="glyphicon glyphicon-user"></i><span class="caret"></span>'+userObj.name);
        api.getStudies(model.key,setStudies);
      }
      // function getExptOfStudy(studyName){
      //   var exptRes=[];
      //   var studyObj = model.studyNames;
      //   $.each(studyObj, function(key, value) {
      //       $.each(value, function(key2, value2) {
      //           if (key2.indexOf('name')!=-1){
      //             var studyName = value2;
      //             if (studyName.indexOf("(")!=-1){
      //               var names = studyName.split("(");
      //               var name = names[0];                   
      //               if (name===studyName){
      //                 exptRes.push(names[1]);
      //               }

      //             }else{

                    
      //             }
                  
      //           }
                 
      //        });    
      //   });

      // }
      function setStudies (data){
        
       console.log(data);
       $('#studyModel').modal('hide');
       $('.dropdownLI').html('');
        $('#studyTable > tbody').html('');
        var obj;
        var studies=[];
        if(typeof data =='object'){
          obj = data;
        }else{
          obj = $.parseJSON( data );
        }
        model.studyNames=obj;
        model.selectedName='';
        var sortArray= new Array();
        $.each(obj, function(key, value) {
            console.log(key + "/"+value);
            sortArray.push(key);
            //update(key);
            
        });
        sortArray.sort();
        for (var i=0;i<sortArray.length;i++){
          update(sortArray[i]);
        }
        if (model.activePage === 'file'){
           //$('#fileSys').click();

        }
            
      }
      function openStudyValidation(data){
        //debugger;
        var errors = data.split("<br/>");
        console.log(errors);
        var len = errors[0].length;
        errors[0]=errors[0].slice(4,len);
        $('#validateTable > tbody').empty();
        if (errors.length===0){
          $('#validateTable > tbody').append('<tr><td>No Errors Found</td></tr>');
        }
        for (var i=0;i<errors.length;i++){
          var error = errors[i];
          $('#validateTable > tbody').append('<tr><td>'+error+'</td></tr>');
        }
        $('#validateModal').modal('show');
      }

      function openValidation(data){
        console.log(data);
        var configuration = '/* jshint undef: true, es3:true */';
        var globals = '/* global define,xGetCookie,$,top */';
        var cont =globals+'\n'+configuration+'\n'+data;
        JSHINT(cont);
        console.log(JSHINT.errors);
         $('#validateTable > tbody').empty();
        for (var i=0;i<JSHINT.errors.length;i++){

              //console.log(JSHINT.errors[i]);
              var obj = JSHINT.errors[i];
              var a = obj.a;
              var b = obj.b;
              var c = obj.c;            
              var d = obj.d;            
              var objerr = obj.id;
              var rawobj = obj.raw;
              var rawS = parseline(rawobj,a,b,c,d);
              var line = obj.line;
              var char = obj.character;
              var error = 'Error: '+objerr+'     '+'Description: '+rawS+'     '+'line: '+line+'     '+'charecter: '+char;
              //var error = JSON.stringify(obj, null, 2);
              $('#validateTable > tbody').append('<tr><td>'+error+'</td></tr>');
              
        }
        if (JSHINT.errors.length===0){
         $('#validateTable > tbody').append('<tr><td>No Errors Found</td></tr>');
        }
        $('#validateModal').modal('show');
      }

      /**
      * Desc: changes the folder from open
      * to close state or vise versa when
      * it is being clicked.
      */

      function changeFolderState(name,id){
        var obj = model.openStruct;
        var pathA = new Array();
        var path='';
        var info = {};
        info.found = false;
        getPath(model.fileSystem,id,pathA,info);
        for (var i=0;i<pathA.length;i++){
          path+=pathA[i]+'/';
        }
        for (var key in obj) {
           if (obj.hasOwnProperty(key)) {
              if (key===path){
                if(obj[key]==='open'){
                  obj[key]='close';
                }else{
                  obj[key]='open';
                }
              }
           }
        }
        // $.each(obj,function(k,v){
        //   if (k===id){
        //     if (v==='open'){
        //       v='close' ;
        //     }else{
        //       v='open';
        //     } 
        //   }

        // });
       
      }



      // function changeFolderState(name,id){
      //   var info = {};
      //   info.found = false;
      //   var element;
      //   findElement(fileObj,id,info);
      //   var folder = info.folder;
      //   if (folder.state!=null){
      //     if (folder.state==='open'){
      //       folder.state = 'close';
      //     }else{
      //       folder.state = 'open';

      //     }
      //   }else{
      //     folder.state='open';
      //   }
      // }

      function takespaces(name){ return name.replace(/\s+/g, '');}

      /* Returns the folder object according to name


      */

      function findFolder(ObjTree,name,id){
        var res;
        //debugger;
        $.each(ObjTree, function(k, v) {
          if (k===name){
            res= v;
            return false;
          }
          if (k.indexOf(".")===-1 && k!='state' && k!='id'){
            res = findFolder(v,name);
            if (res!=undefined){
              return false;
            }
            
          }
          
         });
        return res;
      }

      
      function sortedKeys(filesObj){
        var sortArray= new Array();
        $.each(filesObj, function(key, value) {
            sortArray.push(key);
        });
        sortArray.sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        //sortArray.sort();
        return sortArray;
      }
      function createRaws(filesObj,recursive,user){

        fileTableModel.level=fileTableModel.level+1;
        var keys = sortedKeys(filesObj);
        
        if (recursive===false){

          $('#result').html('');
          createDandD();
          createTable();
        }

         var numOfElements=0;
         for (var i=0;i<keys.length;i++){
            var k = keys[i];
            if (k!='state' && k!='id'){
               numOfElements++;
            }
            var extension = k.split(".");
            if (extension.length>1){
              if (extension[1]==='jsp' && user===false){
               addJspRaw(k,fileTableModel.level,filesObj[k]);
             }else{
               if (extension[1]==='expt' && user===false){
               addExptRaw(k,fileTableModel.level,filesObj[k]);
               }else{
                 if (extension[1]==='js' && user===false){
                   addJSRaw(k,fileTableModel.level,filesObj[k]);
                 }else{
                   addFileRaw(k,fileTableModel.level,filesObj[k]);
                 }
               }
             }
            }else{
             if (k!='state' && k!='id'){
               addFolderRaw(k,fileTableModel.level,filesObj[k]);
               if (FolderState(filesObj[k])==='open'){
                 createRaws(filesObj[k],true,user);
                 fileTableModel.level=fileTableModel.level-1;
               }
             }
            
           }


            
         }
         if (numOfElements===0){
          addEmptyRaw(fileTableModel.level);

         }
        // var numOfElements=0;
        // $.each(filesObj, function(k, v) {
        //   if (k!='state' && k!='id'){
        //     numOfElements++;
        //   }
          
        //   var extension = k.split(".");
        //   if (extension.length>1){
            
        //     if (extension[1]==='jsp' && user===false){
        //       addJspRaw(k,fileTableModel.level,v);
        //     }else{
        //       if (extension[1]==='expt' && user===false){
        //       addExptRaw(k,fileTableModel.level,v);
        //       }else{
        //         if (extension[1]==='js' && user===false){
        //           addJSRaw(k,fileTableModel.level,v);
        //         }else{
        //            addFileRaw(k,fileTableModel.level,v);
        //         }
        //       }
        //     }
        //   }else{
        //     if (k!='state' && k!='id'){
        //       addFolderRaw(k,fileTableModel.level,v);
        //       if (FolderState(v)==='open'){
        //         createRaws(v,true,user);
        //         fileTableModel.level=fileTableModel.level-1;
        //       }
        //     }
            
        //   }
        // });
        // if (numOfElements===0){
        //   addEmptyRaw(fileTableModel.level);

        // }
      }

      function addExptRaw(file,level,v){
        fileTableModel.row = fileTableModel.row+1;

        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+v.id+'" >'+
            '<span class="fileNameSpan" style="margin-left:'+level*50+'px" ><input type="checkbox" class="check" style="margin-right:10px;">'+
              '<i class="fa fa-file-text" ></i> '+file+
            '</span>'+
          '</td>'+
          '<td>'+
            '<button type="button" class="btn btn-primary btn-xs Svalidate">Run study validator</button>'+
            '<button type="button" style="margin-left:20px;" class="btn btn-primary btn-xs testStudy">Test the study</button>'+
            '<button type="button" style="margin-left:20px;" class="btn btn-primary btn-xs runData">Run data tester</button>'+
            '<button type="button" id="viewFile" style="margin-left:20px;" class="btn btn-primary btn-xs">View File</button>'+
            '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
            '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
            '<button type="button" id="deployButton" style="margin-left:20px;" class="btn btn-primary btn-xs">Deploy</button>'+
            '<button type="button" style="margin-left:20px;" id="statisticsButton" class="btn btn-primary btn-xs ">Statistics</button>'+
            '<button type="button" style="margin-left:20px;" id="dataFile" class="btn btn-primary btn-xs ">Data</button>'+
           '</td>'+
        '</tr>');
      }
      function addJspRaw(file,level,v){
        fileTableModel.row = fileTableModel.row+1;
        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+v.id+'" >'+
            '<span style="margin-left:'+level*50+'px"><input type="checkbox" class="check" style="margin-right:10px;"><i class="fa fa-file-text" >'+
            '</i> '+file+
            '</span>'+
          '</td>'+
          '<td>'+
                '<button type="button" id="viewFile" class="btn btn-primary btn-xs">View File</button>'+
                '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
                '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
          '</td>'+
        '</tr>');
      }
      function addJSRaw(file,level,v){
        fileTableModel.row = fileTableModel.row+1;
        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+v.id+'">'+
            '<span class="fileNameSpan" style="margin-left:'+level*50+'px"> <input type="checkbox" class="check" style="margin-right:10px;">'+
              '<i class="fa fa-file-text" ></i> '+file+
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
      function addFileRaw(file,level,v){
        fileTableModel.row = fileTableModel.row+1;
        $('#fileTabale > tbody').append('<tr>'+
          '<td class="file" id="'+v.id+'" >'+
            '<span class="fileRaw" style="margin-left:'+level*50+'px"><input type="checkbox" class="check" style="margin-right:10px;">'+
              '<i class="fa fa-file-text"  ></i> '+file+
            '</span>'+
          '</td>'+
          '<td>'+
                '<button type="button" id="viewFile" class="btn btn-primary btn-xs">View File</button>'+
                '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
                '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
          '</td>'+
        '</tr>');
      }
      
      function addFolderRaw(file,level,v){

        fileTableModel.row = fileTableModel.row+1;
        var raw = fileTableModel.row;
        $('#fileTabale > tbody').append('<tr>'+
            '<td id="'+v.id+'" >'+
              '<span  style="margin-left:'+level*50+'px"><input type="checkbox" class="check" style="margin-right:10px;">'+
                '<span class="folder" style="cursor:pointer"><i class="fa fa-folder" ></i> '+file+'</span>'+
              '</span>'+
            '</td>'+
            '<td>'+
                '<button type="button" id="uploadFile" class="btn btn-primary btn-xs">Upload File</button>'+
                '<button type="button" style="margin-left:20px;" id="newFolder" class="btn btn-primary btn-xs">Create New Folder</button>'+
                '<button type="button" style="margin-left:20px;" id="deleteFolder" class="btn btn-primary btn-xs ">Delete Folder</button>'+
            '</td>'+
          '</tr>');

      }
      function addEmptyRaw(level){

        fileTableModel.row = fileTableModel.row+1;
        var raw = fileTableModel.row;
        $('#fileTabale > tbody').append('<tr>'+
            '<td class="" id="" >'+
              '<span style="margin-left:'+level*50+'px;">'+
                'Folder is Empty'+
              '</span>'+
            '</td>'+
            '<td>'+
            '</td>'+
          '</tr>');

      }


      function setFilePerUser(data){

        fileObj = jQuery.parseJSON( data );
        createTable();
        createUserRaws(fileObj,false);

      }

      function setOpenStruct(fileObj){
      
         
         $.each(fileObj, function(k, v) {
            var extension = k.split(".");
            if (extension.length>1){//file 
            }else{
              if (k!='state' && k!='id'){
                var obj = model.openStruct;
                $.each(v, function(k2, v2) {
                  if (k2==='id'){
                    var pathA = new Array();
                    var path='';
                    var info = {};
                    info.found = false;
                    getPath(model.fileSystem,v2,pathA,info);
                    for (var i=0;i<pathA.length;i++){
                      path+=pathA[i]+'/';
                    }
                    obj[path] = 'close';
                  }
                });
                setOpenStruct(v);
                
              }
              
            }
          });
         
      }
      // function setUserFileTable(data){
      //   //console.log(data);
      //   $('#uploadedModal').modal('hide');
      //   fileObj = jQuery.parseJSON( data );
      //   createTable();
      //   var index ={};
      //   index.index=0;
      //   setIds(fileObj,index);
      //   model.openStruct={};
      //   model.fileSystem = fileObj;
      //   setOpenStruct(fileObj,model.openStruct);
      //   //createRaws(fileObj,false,fileTableModel.user);
      //   createRawsWButt(fileObj,false);
        
        

      // }

      function addFolderRawB (file,level,v){
          
          $('#fileTabale > tbody').append(
            '<tr>'+
              '<td class="folder" id="'+v.id+'" >'+
                '<span  style="margin-left:'+level*50+'px"><i class="fa fa-folder" ></i> '+file+'</span>'+
              '</td>'+
              '<td>'+
                '<button type="button" id="uploadFile" class="btn btn-primary btn-xs">Upload File</button>'+
              '</td>'+  
              '<td>'+  
                  '<button type="button" style="margin-left:20px;" id="newFolder" class="btn btn-primary btn-xs">Create New Folder</button>'+
              '</td>'+    
              '<td>'+    
                  '<button type="button" style="margin-left:20px;" id="deleteFolder" class="btn btn-primary btn-xs ">Delete Folder</button>'+
              '</td>'+
            '</tr>'
          );
      }

      function addFileRawB (file,level,v){

          
          $('#fileTabale > tbody').append(
            '<tr>'+
             '<td class="file" id="'+v.id+'" >'+
               '<span class="fileRaw" style="margin-left:'+level*50+'px">'+
                  '<i class="fa fa-file-text"  ></i> '+file+
                '</span>'+
              '</td>'+
              '<td>'+
                '<button type="button" id="viewFile" class="btn btn-primary btn-xs">View File</button>'+
              '</td>'+
              '<td>'+
                '<button type="button" style="margin-left:20px;" id="downloadFile" class="btn btn-primary btn-xs">Download File</button>'+
              '</td>'+  
              '<td>'+
                '<button type="button" style="margin-left:20px;" id="deleteFile" class="btn btn-primary btn-xs ">Delete File</button>'+
              '</td>'+
            '</tr>');
     }
      
      // function createRawsWButt(filesObj,recursive){

      //     fileTableModel.level=fileTableModel.level+1;
      //     if (recursive===false){
      //       $('#result').html('');
      //       createTable();
      //     }
      //     $.each(filesObj, function(k, v) {
      //       var extension = k.split(".");
      //       if (extension.length>1){
      //       addFileRawB(k,fileTableModel.level,v);
      //       }else{
      //         if (k!='state' && k!='id'){
      //           addFolderRawB(k,fileTableModel.level,v);
      //           $.each(v, function(k2, v2) {
      //             if (k2==='state'){
      //               if (v2==='open'){
      //                 createRawsWButt(v,true);
      //                 fileTableModel.level=fileTableModel.level-1;
      //               }
      //             }
      //           });
      //         }
              
      //       }
      //     });
      // }
      function setIds(filesObj,index){

        $.each(filesObj, function(k, v) {
          index.index++;
          var extension = k.split(".");
          if (extension.length>1){
            v.id='file'+index.index;
          }else{
            if (k!='state' && k!='id'){
              v.id="folder"+index.index;
              setIds(v,index);
              
            }
          }
        });

      }
      /**
      * Desc: callback function that sets 
      * the table of studies and the study dropdown
      *
      */
      function setStudyTable(data){
        //console.log(data);
        $('#uploadedModal').modal('hide');
        fileObj = jQuery.parseJSON( data );
        var index ={};
        index.index=0;
        setIds(fileObj,index);
        model.openStruct={};
        model.fileSystem = fileObj;
        model.studyFileSystem=fileObj;
        setOpenStruct(fileObj,model.openStruct);
        fileTableModel.user = false;
        $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">Studies</a></li>');
        
        createRaws(fileObj,false,fileTableModel.user);
        

      }
      function createDandD(){
        $('#result').append('<div id="dragandrophandler">Drag & Drop Files Here</div>');
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
             var files = e.originalEvent.dataTransfer.files;
         
             //We need to send dropped files to Server
             $('#uploadedModal').modal('show');
             DrophandleFileUpload(files,obj);
        });
      }

      function DrophandleFileUpload(files,obj){

        $( '.check' ).each(function( index ) {
          var input = $(this);
          var tr  = $(input).parent().parent();
          var id = $(tr).attr("id");
          if (id===undefined){
            var upTD = $(tr).find('.folder');
            id = $(upTD).attr("id");
          }
          
          //var id = $(tr).attr("id");
          if ($(input).prop('checked')){
            
            model.elementID = id;
            $(this).attr('checked', false);

          }
        });
        if (model.elementID===undefined) model.elementID='0';
        var data =new FormData();
        var pathA = new Array();
        var study;
        var info={};
        info.found=false;
        var path='';
        if (model.elementID==='0'){
          path="/";
          study=model.study;
          if (study===undefined) study='all';
        }else{
          getPath(model.fileSystem,model.elementID,pathA,info);
          for (var i=0;i<pathA.length;i++){
            path+=pathA[i]+'/';
          }
          study='all';
        }
        
        $.each(files, function(key, value)
        {
          data.append(key, value);
        });
        if (model.activePage === 'file') model.study='all';
        data.append('UserKey',model.key);
        data.append('folder',takespaces(path));
        data.append('study',study);
        data.append('cmd','UploadFile');
        
        api.uploadFile(data,fileOpSuccess);

      }
      /**
      * Desc: returns the satet of the folder
      * input: folder key/value object
      *
      */
      function FolderState(folder){
        var id;
        var state;
        $.each(folder,function(k,v){
          if (k==='id'){
            id=v;
          }
          

        });
        var pathA = new Array();
        var path='';
        var info = {};
        info.found = false;
        getPath(model.fileSystem,id,pathA,info);
        for (var i=0;i<pathA.length;i++){
          path+=pathA[i]+'/';
        }
        var obj = model.openStruct;
        $.each(obj,function(k,v){
          if (k===path){
            state= v;
          }

        });
        return state;
      }
      
      function createTable(){
        fileTableModel.row =0;
        fileTableModel.level =0;
        //if (model.activePage === 'file'){                    
          //$('#result').append('<table id="fileTabale" class="table table-striped table-hover"><thead><th></th><th></th></thead><tbody id="body"></tbody></table>');          
        //}else{
          $('#result').append('<table id="fileTabale" class="table table-striped table-hover"><thead><th></th><th></th></thead><tbody id="body"></tbody></table>');
          $('#fileTabale > tbody').append(
            '<tr>'+
              '<td id="0" >'+
                '<span  style="margin-left:0px;">+<span class="folder" ></span></span>'+
              '</td>'+
              '<td>'+
                '<button type="button" id="uploadFile" class="btn btn-primary btn-xs">Upload File</button>'+
                '<button type="button" style="margin-left:20px;" id="newFolder" class="btn btn-primary btn-xs">Create New Folder</button>'+
                '<button type="button" style="margin-left:20px;" id="multiple" class="btn btn-primary btn-xs">Multiple Download</button>'+
              '</td>'+    
            '</tr>'
          );
        //}
        

      }
      function update(name){
        $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="0" href="#">'+name+'</a></li>');
        $('#studyTable > tbody').append(makerow(name));

      }
      function makerow(val){

        id++;
        var html='';
        html+='<tr class="tableRaw" style="cursor:pointer">'+
              '<td class="studyRaw"><span href="#" data-toggle="modal" data-target="#myModal" class="">'+val+'</span>'+
              '</td>'+
              '<td class="">Runing</td>'+
              '<!--<td class="">'+
                  '<button type="button" class="btn btn-primary btn-xs statistics">Statistics</button>'+
              '</td>'+
              '<td class="">'+
                  '<button type="button" class="btn btn-primary btn-xs test" >Test</button>'+
              '</td>'+
             '<td class="">'+
                  '<button type="button" class="btn btn-primary btn-xs" id="1deploy">Deploy</button>'+
              '</td>-->'+
          '</tr>';
        return html;
      }
      
      function findStudy(study){
        var obj = model.studyNames;
        var res;
        $.each(obj, function(key, value) {
          $.each(value, function(key2, value2) {
              if (key2.indexOf('name')!=-1){
                if (value2===study){
                  res=value;
                  return false;

                }
                   
              }
               
          });    
        });
        return res;
      }
      function getExptid(name){
        
        var study = findStudy(name);
        var res=[];
        $.each(study, function(key, value) {
            if (key.indexOf('exptID')!=-1){
              res.push(value);
              
            }
               
        });
        return res;    
      }

     
      function takeOutBraclet(name){
        var studyName;
        if (name.indexOf("(")!=-1){
           var studies = name.split("(");
           studyName = studies[0];
           return studyName;  
         }else{
          return name;

         }
      }
      function appendTracker(studyExpt){
        var track;
        if (model.activeTracker===undefined){
          track = new Tracker(model,'design1');
          model.tracker={};
          model.tracker.db = 'Research';
          model.tracker.list = 'Any';
          model.activeTracker =track;
          model.active = track;
        }else{
          //track = model.activeTracker;
        }
        
        //Tracker(model,'design1');
        
        //Tracker.getTracker(studyExpt);
        model.activeTracker.getTracker(studyExpt);
        ////track.getTable(studyExpt,true);
        
      }

     
  });
        
});
