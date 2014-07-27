
    //////////Globals//////////

    var id=0;
    var fileTableModel ={};
    fileTableModel.user=false;
    var fileObj;
    var study;
    


                   
      $("#fileTabale tr").contextMenu({

          menuSelector: "#contextMenu",
          menuSelected: function (invokedOn, selectedMenu) {
              var msg = "You selected the menu item '" + selectedMenu.text() +
                  "' on the value '" + invokedOn.text() + "'";
              alert(msg);
          }
      });

    $(document).on("click",'#validateOK', function(){

     // $('#validateTable > tbody').remove();

    });  
    $(document).on("click",'.tableVal', function(){

      console.log($(this).text());
      study = $(this).text();
      $('.studyButt').text(study);

      

      //study =  

    });
    $(document).on("click",'#fileSys', function(){

      fileTableModel.user=true;
      getFiles(key,'all',setUserFileTable);

    });
    $(document).on("click",'.testStudy',function(){
       console.log($(this));
       debugger;
       var button = $(this);
       var span = $(button).parent().parent().find('.fileNameSpan');
       console.log(span);
       var fname = takespaces($(span).text());
       getUserName(takespaces(key),function(data){
        var user = data;
        window.open("https://dw2.psyc.virginia.edu/implicit/Launch?study=/user/"+user+"/"+study+"/"+fname+"&refresh=true");


       });
       
       

    });
    $(document).on("click",'.Svalidate',function(){
       console.log($(this));
       debugger;
       var button = $(this);
       var span = $(button).parent().parent().find('.fileNameSpan');
       console.log(span);
       var fname = $(span).text();
       Studyvalidate(key,study,takespaces(fname),openStudyValidation);

    });
    $(document).on("click",'.validate',function(){
       console.log($(this));
       debugger;
       var button = $(this);
       var span = $(button).parent().parent().find('.fileNameSpan');
       console.log(span);
       var fname = $(span).text();
       validateFile(key,study,takespaces(fname),openValidation);

    });
    $(document).on("click",'.folder',function(){
      console.log($(this));
      debugger;
      var td = $(this);
      var tr = $(td).parent();
      var folderName = $(tr).text();
      changeFolderState(folderName);
      createRaws(fileObj,false,fileTableModel.user);
    });

    $(document).on("click",'.test',function(){
           
      fileTableModel.user=true;
      console.log($(this));
      var button = $(this);
      var anchor = $(button).parent().parent().find('a');
      study = $(anchor).text();
      console.log(key);
      getFiles(key,study,setFileTable);


    });

    function parseline(str,a,b,c,d){
        var res = str.replace('{a}',a);
        res = res.replace('{b}',b);
        res = res.replace('{c}',c);
        res = res.replace('{d}',d);

        return res;


    }

    function openStudyValidation(data){
      debugger;
      var errors = data.split("<br/>");
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

    function changeFolderState(name){
      var folder = findFolder(fileObj,takespaces(name));
      if (folder.state!==null){
        if (folder.state==='open'){
          folder.state = 'close';
        }else{
          folder.state = 'open';

        }
      }else{
        folder.state='open';
      }
    }

    function takespaces(name){ return name.replace(/\s+/g, '');}

    function findFolder(ObjTree,name){
      var res;
      debugger;
      $.each(ObjTree, function(k, v) {
        if (k===name){
          res= v;
          return false;
        }
        if (k.indexOf(".")===-1 && k!='state'){
          res = findFolder(v,name);
          if (res!=undefined){
            return false;
          }
          
        }
        
       });
      return res;
    }

    
    function createRaws(filesObj,recursive,user){

      fileTableModel.level=fileTableModel.level+1;
      if (recursive===false){

        $('#result').html('');
        createTable();
      }
      debugger;
      $.each(filesObj, function(k, v) {
        debugger;
        console.log(k + ' is ' + v);
        var extension = k.split(".");
        if (extension.length>1){

          if (extension[1]==='jsp' && user===false){
            addJspRaw(k,fileTableModel.level);

          }else{
            if (extension[1]==='expt' && user===false){
            addExptRaw(k,fileTableModel.level);

            }else{
              if (extension[1]==='js' && user===false){
                addJSRaw(k,fileTableModel.level);

              }else{

                 addFileRaw(k,fileTableModel.level);

              }
            }

          }
          
        }else{
          if (k!='state'){
            addFolderRaw(k,fileTableModel.level);
            $.each(v, function(k2, v2) {
              if (k2==='state'){
                if (v2==='open'){
                  createRaws(v,true,user);
                  fileTableModel.level=fileTableModel.level-1;
                }
              }
            });
          }
          
        }
      });
    }

    function addExptRaw(file,level){
      fileTableModel.row = fileTableModel.row+1;

      $('#fileTabale > tbody').append('<tr><td><i class="fa fa-file-text" ></i><span class="fileNameSpan" style="margin-left:'+level*50+'px"> '+file+
        '</span></td><td><button type="button" class="btn btn-primary btn-xs Svalidate">Run study validator</button><button type="button" style="margin-left:20px;" class="btn btn-primary btn-xs testStudy">Test the study</button><button type="button" style="margin-left:20px;" class="btn btn-primary btn-xs runData">Run data tester</button></td></tr>');
    }
    function addJspRaw(file,level){
      fileTableModel.row = fileTableModel.row+1;
      $('#fileTabale > tbody').append('<tr><td><i class="fa fa-file-text" ></i><span style="margin-left:'+level*50+'px"> '+file+'</span></td><td></td></tr>');
    }
    function addFileRaw(file,level){
      fileTableModel.row = fileTableModel.row+1;
      $('#fileTabale > tbody').append('<tr><td ><i class="fa fa-file-text" ></i><span class="fileRaw" style="margin-left:'+level*50+'px"> '+file+'</span></td><td></td></tr>');
    }
    
    function addFolderRaw(file,level){

      fileTableModel.row = fileTableModel.row+1;
      var raw = fileTableModel.row;
      $('#fileTabale > tbody').append('<tr><td class="folder"><i class="fa fa-folder" ></i><span style="margin-left:'+level*50+'px"> '+file+'</span></td><td></td></tr>');

    }


    function setFilePerUser(data){

      fileObj = jQuery.parseJSON( data );
      createTable();
      createUserRaws(fileObj,false);

    }

    function setUserFileTable(data){
      console.log(data);
      fileObj = jQuery.parseJSON( data );
      createTable();
      debugger;
      createRaws(fileObj,false,fileTableModel.user);
      

    }
    function setFileTable(data){
      console.log(data);
      fileObj = jQuery.parseJSON( data );
      createTable();
      debugger;
      createRaws(fileObj,false,false);
      

    }

    function addJSRaw(file,level){
      fileTableModel.row = fileTableModel.row+1;
      $('#fileTabale > tbody').append('<tr><td><i class="fa fa-file-text" ></i><span class="fileNameSpan" style="margin-left:'+level*50+'px"> '+file+'</span></td><td><button type="button" class="btn btn-primary btn-xs validate">Check js syntax</button></td></tr>');

    }    
    function createTable(){
      fileTableModel.row =0;
      fileTableModel.level =0;
      $('#result').append('<table id="fileTabale" class="table table-striped table-hover"><thead><th></th><th></th></thead><tbody></tbody></table>');

    }
    function update(value){
        $('.dropdownLI').append('<li role="presentation"><a class="tableVal" role="menuitem" tabindex="-1" href="#">'+value+'</a></li>');
            $('#studyTable > tbody').append(makerow(value));

    }
    function makerow(val){

      id++;
      var html='';
      html+='<tr>'+
                '<td><a href="#" data-toggle="modal" data-target="#myModal" class="">'+val+'</a>'+
                '</td>'+
                '<td class="">Runing</td>'+
                '<td class="">15%</td>'+
                '<td class="">'+
                    '<button type="button" class="btn btn-primary btn-xs" data-toggle="modal"'+
                    'data-target="#myStats">Statistics</button>'+
                '</td>'+
                '<td class="">'+
                    '<button type="button" class="btn btn-primary btn-xs test" >Test</button>'+
                '</td>'+
               '<td class="">'+
                    '<button type="button" class="btn btn-primary btn-xs" id="1deploy">Deploy</button>'+
                '</td>'+
            '</tr>';
      return html;
    }
    



    $(document).on("click",'#submitest',function(){
      $("#dashboardArea").empty();
      $('#dashboardArea').append('<div><iframe src="https://dw2.psyc.virginia.edu/implicit/showfiles.jsp?user=yba&study=popuptest" width="750" height="450"></iframe></div>');
      
    });
    $(document).on("click",'#submitest2',function(){
       $("#dashboardArea").empty();
      $('#dashboardArea').append('<div><iframe src="https://dw2.psyc.virginia.edu/implicit/user/bgoldenberg/ruleGenerator/deploy.html#" width="750" height="450"></iframe></div>');
      
    });

    $('#1test').click(function(){
      //$("#testModelBody").empty();
      //$('#testModelBody').append('');
      //window.open("https://dw2.psyc.virginia.edu/implicit/showfiles.jsp?user=yba&study=popuptest");
      $('#testModal').modal('show');
      
    });  
    $('#1deploy').click(function(){
      //$("#dashboardArea").empty();
      //$('#dashboardArea').append('');
      //window.open("https://dw2.psyc.virginia.edu/implicit/user/bgoldenberg/ruleGenerator/deploy.html");
      
      $('#deployModal').modal('show');
      
      
    });  
    $('#2test').click(function(){
      $('#testModal').modal('show');
      //window.open("https://dw2.psyc.virginia.edu/implicit/showfiles.jsp?user=yba&study=popuptest");
      
    });  
    $('#2deploy').click(function(){
      $('#deployModal').modal('show');
      //window.open("https://dw2.psyc.virginia.edu/implicit/user/bgoldenberg/ruleGenerator/deploy.html");
      
    });  
    $('#3test').click(function(){
     $('#testModal').modal('show');
     //window.open("https://dw2.psyc.virginia.edu/implicit/showfiles.jsp?user=yba&study=popuptest");
      
      
    });  
    $('#3deploy').click(function(){
      $('#deployModal').modal('show');
     //window.open("https://dw2.psyc.virginia.edu/implicit/user/bgoldenberg/ruleGenerator/deploy.html");
      
    });  
    $('#homemenu').click(function(){
      $("#dashboardArea").empty();
      //$('#dashboardArea').append(personal);
      
    });  
    $('#testmenu').click(function(){
      $("#dashboardArea").empty();
      $('#dashboardArea').append('<div>Study ID: <input type="text"></input><button type="button" class="btn btn-primary btn-xs" id="submitest" style="margin-left:10px;" onclick="submitTest()">Submit</button></div>');
      
    });
    $('#deploymenu').click(function(){
      $("#dashboardArea").empty();
      $('#dashboardArea').append('<div>Study ID: <input type="text"></input><button type="button" class="btn btn-primary btn-xs" id="submitest" style="margin-left:10px;" onclick="submitTest()">Submit</button></div>');
      
    });
        
