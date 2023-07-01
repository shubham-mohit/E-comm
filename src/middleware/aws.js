const aws = require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
      // this function will upload file to aws and return the link
      let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws
  
      var uploadParams = {
        ACL: "public-read",
        Bucket: "classroom-training-bucket", //HERE
        Key: "abc/" + file.originalname, //HERE
        Body: file.buffer,
      };
  
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject({ error: err });
        }
        console.log("file uploaded succesfully");
        return resolve(data.Location);
      });
    });
  };

  const awsApi = async function(req,res,next){
    try {
        let files = req.files
        if(files.length == 0) {return res.status(400).send({status:false, message: "Plz Enter Image"})}
        if(files && files.length > 0) {
            const uploadFileUrl = await uploadFile(files[0])
            req.uploadFileUrl = uploadFileUrl
        }
        next()
    } catch (error) {
        res.status(400).send(error.message)
    }
  }

  module.exports = {awsApi}