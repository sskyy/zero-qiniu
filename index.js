var qiniu = require('qiniu')
var fs = require("fs")
var request = require('request')
var base64_encode = require('base64').encode;
var Buffer = require('buffer').Buffer;
var uuid = require('node-uuid')



function uptoken( config) {
  qiniu.conf.ACCESS_KEY =config.accessKey;
  qiniu.conf.SECRET_KEY = config.secretKey;
  var putPolicy = new qiniu.rs.PutPolicy(config.bucket);
  //putPolicy.callbackUrl = callbackUrl;
  //putPolicy.callbackBody = callbackBody;
  //putPolicy.returnUrl = returnUrl;
  //putPolicy.returnBody = returnBody;
  //putPolicy.asyncOps = asyncOps;
  //putPolicy.expires = expires;
  //if(putPolicy.persistentOps) putPolicy.persistentOps= ['avthumb/webm/an/1','vsample/jpg/ss/1/t/1/pattern/'+base64_encode(new Buffer(uuid.v4()+"-$(count)"))].join(";");
  if(putPolicy.persistentOps) putPolicy.persistentOps = config.persistentOps
  if(config.persistentPipeLine) putPolicy.persistentPipeline = config.persistentPipeLine;//"twentyone"

  console.log( config, "config........")
  return putPolicy.token();
}

module.exports = {
  route : {
    "GET /qiniu/status/:pid" : function( req, res){
      request('http://api.qiniu.com/status/get/prefop?id='+req.param('pid'),function( err, respond, body){
        console.log( err, body )
        res.json(JSON.parse(body))
      })
    }
  },
  reliers : {},
  expand : function( module ){
    var root = this
    if( module.qiniu ){
      root.reliers[module.name] = module.qiniu
      var route = root.uptokenRoute( module.name)

      root.dep.request.add( route.url, route.handler )
    }
  },
  uptokenRoute : function( name ){
    var root = this

    return {
      url: "GET /qiniu/uptoken/" + name,
      handler: function (req, res) {
        res.json({uptoken:uptoken(root.reliers[name])})
      }
    }
  }
}