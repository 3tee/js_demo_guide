(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports){
        module.exports = factory();
    } else {
        global.RestJs = factory();
    }
})(this, function () {
	
    function RestJs(serverURI) {
    	   var self = this;
       this.restServer = serverURI;

       this.getAccessToken = function (accessKey,secretKey,successCallback,failCallback) {
       	   var digest = getSignature(accessKey,secretKey);
       	   
       	   auth(digest,accessKey,secretKey,function(accessToken){
       	   	     successCallback(accessToken);
       	   },function(error){
       	   	     failCallback(error);
       	   });
       };
       
       this.createRoom = function (accessToken, topic, maxVideo,maxAudio,hostPassword,roomMode,successCallback,failCallback) {
       	    create(accessToken, topic, maxVideo,maxAudio,hostPassword,roomMode,function(roomId){
       	    	    successCallback(roomId);
       	    },function(error){
       	   	     failCallback(error);
       	    });
       };
       
       function getSignature(accessKey, secretKey){
       	    var  digest;
       	    try {
                 digest = doHMAC(accessKey,secretKey);
			} catch(e) {
				console.log(e);
			}
       	    return digest;
        };
       
        
        function auth(digest,accessKey,secretKey,successCallback,failCallback){
        	    var protocolStr = document.location.protocol;
	      	var urlStr =  protocolStr + "//"+ self.restServer + "/rtc/auth/valid?access_key=" + encodeURI(accessKey) + "&digest=" + digest;
			$.ajax({
			       type: "get",
			       url: urlStr,
			       dataType: "jsonp",
			       jsonpCallback:"test",
			       timeout: 5000,
			       success: function (retObj) {
			       	           if("0" == retObj.ret ){
			       	           	     var random = retObj.random;
			       	                  var key = retObj.key;
			       	                  accessToken = doHMAC(random+":"+key,secretKey);
				                      successCallback(accessToken);
			       	           }else{
			       	           	    var msg = retObj.msg;
			       	           	    failCallback("获取访问令牌失败！error code:"+retObj.ret+";error message:"+msg);
			       	           }
			       		    },
				   error: function (XMLHttpRequest, textStatus, errorThrown){
					 	       failCallback("获取访问令牌失败！error code:"+XMLHttpRequest.status+";error message:"+XMLHttpRequest.statusText);
	                       }
			});
        };
        
        function doHMAC(object1,object2){
        	    var hmacType = "TEXT";
			var hmacOutputType = "HEX";
			var hmacVariant = "SHA-1";
			
			var hmacObj = new jsSHA(object1, hmacType);
			digest = hmacObj.getHMAC(object2,hmacType,hmacVariant,hmacOutputType);
			digest = base64encode(digest);
			return digest;
        }
        
        function create(accessToken, topic, maxVideo,maxAudio,hostPassword,roomMode,successCallback,failCallback){
               var protocolStr = document.location.protocol;
        	       var urlStr =  protocolStr + "//"+ self.restServer + "/rtc/room/create?owner_id=111111&access_tocken=" + accessToken + "&room_mode=" + roomMode+ "&topic=" + topic+ "&max_video=" + maxVideo+ "&max_audio=" + maxAudio+ "&host_password=" + hostPassword;
        	       $.ajax({
			       type: "get",
			       url: urlStr,
			       dataType: "jsonp",
			       jsonpCallback:"test",
			       timeout: 5000,
			       success: function (retObj) {
			       	           if("0" == retObj.ret ){
			       	           	    var roomId = retObj.room_id;
			       	           	    successCallback(roomId);
			       	           }else{
			       	           	    var msg = retObj.msg;
			       	           	    failCallback("创建会议失败！error code"+retObj.ret+";error message:"+msg);
			       	           }
			       		    },
				   error: function (XMLHttpRequest, textStatus, errorThrown){
				   	                failCallback("创建会议失败！error code"+XMLHttpRequest.status+";error message:"+XMLHttpRequest.statusText);
	                       }
			});
        	     
        };
   }
    
   return RestJs;
});