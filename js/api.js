
/*
    API to query the implicit dashboard

    This version is using Require.js 


    




*/

define([], function () {
    
    var api = function () {

        
        this.init = function(model,callback){
            
            var apiParam= this.urlParam('api');
                 

            if (apiParam!=null){
                $('body').html('<h3>API console</h3><div id="console" style="white-space: pre"></div>');
                if (apiParam==='create'){
                    var table = urlParam('table');
                    var name = urlParam('name');
                    var key = urlParam('key');
                    var folder = urlParam('folder');
                    var exptid = urlParam('exptid');
                    var userid = urlParam('userid');
                    data.api = api;
                    data.table = table;
                    data.name = name;
                    data.key = key;
                    data.exptid = exptid;
                    data.userid = userid;
                    data.folder = folder;
                }
                if (apiParam==='find'){
                    var table = urlParam('table');
                    var col = urlParam('by');
                    var val = urlParam('value');
                    data.api = api;
                    data.table = table;
                    data.column = col;
                    data.value = val;

                }
                if (apiParam==='origin'){
                    var base = urlParam('base');
                    data.api = api;
                    data.base = base;
                    


                }
                $.ajax({
                    type: "GET",
                    url: '/implicit/dashboard',
                    data: data,
                    success: apiconsole,
                    error: errorconsole

                });
                
            }else{
                var key = this.urlParam('key');
                model.key=key;
                console.log("calling getfiles api");
                $.ajax({
                    type: "POST",
                    url: '/implicit/dashboard',
                    data: {
                        cmd: 'getstudies',
                        //OSFKey: 'testkey123456'
                        OSFKey: key
                    },
                    success: callback,
                    
                });
            }
        }

        
        this.getUserName = function (key,callback){
            var url = "/implicit/dashboard/getname/"+key;
            $.ajax({
                type: "GET",
                url: url,
                                
            }).done(callback);

        }
        this.Studyvalidate = function (user,study,filename,callback){
            var url = "/implicit/dashboard/studyvalidate/"+user+"/file/"+study+"/"+filename;
            $.ajax({
                type: "GET",
                url: url,
                success: callback
                
            });

        }
        this.validateFile = function (user,study,filename,callback){
            var url = "/implicit/dashboard/validate/"+user+"/file/"+study+"/"+filename;
            $.ajax({
                type: "GET",
                url: url,
                success: callback
                
            });

        }
        this.getFiles = function (user,study,successFunc){
            var url = "/implicit/dashboard/test/"+user+"/files/"+study;
            $.ajax({
                type: "GET",
                url: url,
                success: successFunc
                
            });

        }

        this.getTracker = function (studyexpt,dbString,cpath,db,current,baseURL,callback){
            
            var url = '/implicit/PITracking';
            var data = this.getData(studyexpt,dbString,cpath,db,current,baseURL);
            
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(data),
                success: callback
                
            });

        }
        this.getData = function (study,dbString,curl,db,current,baseURL){
            var data = {};
            var currentdate = new Date(); 
            var datetime =  (currentdate.getMonth())+"/01/"+currentdate.getFullYear();
            var untildatetime =  (currentdate.getMonth()+1)+"/"+currentdate.getDate()+"/"+currentdate.getFullYear();
            data.db = db;
            data.testDB= dbString;
            data.current = current;
            data.study = study;
            data.task = '';
            data.since = datetime;
            data.until = untildatetime;
            data.endTask='';
            data.filter = '';
            data.studyc = 'true';
            data.taskc = '';
            data.datac = '';
            data.timec = '';
            data.dayc = '';
            data.weekc = '';
            data.monthc = '';
            data.yearc = '';
            data.method = '3';
            data.curl=curl;
            data.hurl='';
            data.cpath='';
            data.hpath='';
            data.tasksM='3';
            data.threads = 'yes';
            data.threadsNum = '1';
            data.baseURL = baseURL;
            return data;
        }
        
        this.errorconsole = function (data){
            //$('#console').text(data);
        }
        this.apiconsole = function (data){

            //$('#console').text(data);
        }

        this.urlParam = function (name){
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results==null){
               return null;
            }
            else{
               return results[1] || 0;
            }
        }
        


   };

    return api;
        
});
        
        
        
