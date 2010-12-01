(function() {
  /*
  // Copyright 2010 Cloud Bindings Authors. All Rights Reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License")
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS-IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  */
  /**
   * @fileoverview Objects for communicating with Amazon S3
   *
   * @author aalok@shah.ws (Aalok Shah)
  */  var goog;
  goog = window.goog;
  goog.provide('aws.s3');
  goog.provide('aws.s3.Acp');
  goog.provide('aws.s3.Acl');
  goog.provide('aws.s3.Grant');
  goog.provide('aws.s3.Grantee');
  goog.provide('aws.s3.LocationConstraint');
  goog.provide('aws.s3.Permission');
  goog.provide('aws.s3.Bucket');
  goog.provide('aws.s3.S3Service');
  goog.require('aws.util.HmacSha1');
  goog.require('goog');
  goog.require('goog.array');
  goog.require('goog.iter');
  goog.require('goog.string');
  goog.require('goog.structs.Map');
  aws.s3.Permission = function(strValue) {
    this.strValue = strValue;
  };
  aws.s3.Permission.prototype.toString = function() {
    return this.strValue;
  };
  aws.s3.Permission.prototype.toXmlArray = function() {
    return ['<Permission>', this.strValue, '</Permission>'];
  };
  aws.s3.Permission.prototype.toXml = function() {
    return this.toXmlArray.join('');
  };
  aws.s3.Permission.READ = new aws.s3.Permission("READ");
  aws.s3.Permission.WRITE = new aws.s3.Permission("WRITE");
  aws.s3.Permission.READ_ACP = new aws.s3.Permission("READ_ACP");
  aws.s3.Permission.WRITE_ACP = new aws.s3.Permission("WRITE_ACP");
  aws.s3.Permission.FULL_CONTROL = new aws.s3.Permission("FULL_CONTROL");
  aws.s3.Permission.fromString = function(value) {
    switch (value) {
      case "READ":
        return aws.s3.Permission.READ;
      case "WRITE":
        return aws.s3.Permission.WRITE;
      case "READ_ACP":
        return aws.s3.Permission.READ_ACP;
      case "WRITE_ACP":
        return aws.s3.Permission.WRITE_ACP;
      case "FULL_CONTROL":
        return aws.s3.Permission.FULL_CONTROL;
      default:
        return null;
    }
  };
  aws.s3.LocationConstraint = function(strValue) {
    this.strValue = strValue;
  };
  aws.s3.LocationConstraint.prototype.toString = function() {
    return this.strValue;
  };
  aws.s3.LocationConstraint.prototype.toXmlArray = function() {
    return ['<LocationConstraint xmlns="http://s3.amazonaws.com/doc/2006-03-01/">', this.strValue, '</LocationConstraint>'];
  };
  aws.s3.LocationConstraint.prototype.toXml = function() {
    return this.toXmlArray.join('');
  };
  aws.s3.LocationConstraint.EU = new aws.s3.LocationConstraint("EU");
  aws.s3.LocationConstraint.US_WEST_1 = new aws.s3.LocationConstraint("us-west-1");
  aws.s3.LocationConstraint.AP_SOUTHEAST_1 = new aws.s3.LocationConstraint("ap-southeast-1");
  aws.s3.LocationConstraint.US_CLASSIC = new aws.s3.LocationConstraint("");
  aws.s3.LocationConstraint.fromString = function(value) {
    switch (value) {
      case "EU":
        return aws.s3.LocationConstraint.EU;
      case "us-west-1":
        return aws.s3.LocationConstraint.US_WEST_1;
      case "ap-southeast-1":
        return aws.s3.LocationConstraint.AP_SOUTHEAST_1;
      case "":
        return aws.s3.LocationConstraint.US_CLASSIC;
      default:
        return aws.s3.LocationConstraint.US_CLASSIC;
    }
  };
  aws.s3.Grantee = function(opt_id, opt_displayName) {
    this.id = String(id || "");
    return this.displayName = String(displayName || "");
  };
  aws.s3.Grantee.prototype.toXmlArray = function() {
    var arr;
    if (!this.id || !this.displayName) {
      return [];
    }
    arr = ['<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">', '<ID>', this.id, '</ID>', '<DisplayName>', this.displayName, '</DisplayName>', '</Grantee>'];
    return arr;
  };
  aws.s3.Grantee.prototype.toXml = function() {
    return this.toXmlArray.join('');
  };
  aws.s3.Grant = function(opt_grantee, opt_permission) {
    this.grantee = opt_grantee || null;
    return this.permission = opt_permission || 0;
  };
  aws.s3.Grant.prototype.toXmlArray = function(opt_asStringArray) {
    if (!this.grantee || !this.permission) {
      return [];
    }
    return goog.array.flatten(['<Grant>', this.grantee.toXmlArray(), this.permission.toXmlArray(), '</Grant>']);
  };
  aws.s3.Grant.prototype.toXml = function() {
    return this.toXmlArray.join('');
  };
  aws.s3.Acl = function(grants) {
    grants = grants || [];
    if (!goog.isArray(grants)) {
      grants = [grants];
    }
    return this.grants = grants;
  };
  aws.s3.Acl.prototype.toXmlArray = function() {
    if (this.grants.length <= 0) {
      if (opt_asStringArray) {
        return [];
      } else {
        return "";
      }
    }
    return goog.array.flatten([
      '<AccessControlList>', goog.array.map(this.grants, function(elem, i, arr2) {
        return elem.toXmlArray();
      }), '</AccessControlList>'
    ]);
  };
  aws.s3.Acl.prototype.toXml = function() {
    return this.toXmlArray.join('');
  };
  aws.s3.Acp = function(owner, acl) {
    this.owner = owner || null;
    return this.acl = acl || null;
  };
  aws.s3.Acp.prototype.toXml = function(opt_asStringArray) {
    if (!this.owner || !this.acl) {
      return [];
    }
    return goog.array.flatten(['<AccessControlPolicy>', '<Owner>', '<ID>', this.owner.id, '</ID>', '<DisplayName>', this.owner.displayName, '</DisplayName>', '</Owner>', this.acl ? this.acl.toXmlArray() : [], '</AccessControlPolicy>']);
  };
  aws.s3.Acp.prototype.toXml = function() {
    return this.toXmlArray.join('');
  };
  aws.s3.S3Service = function(awsAccessKeyId, secretAccessKeyId) {
    this.awsAccessKeyId_ = awsAccessKeyId;
    return this.secretAccessKeyId_ = secretAccessKeyId;
  };
  aws.s3.S3Service.prototype.generateAuthorizationHeader = function(signature) {
    return ["AWS ", this.awsAccessKeyId_, ':', signature].join('');
  };
  aws.s3.S3Service.prototype.generateSignature = function(stringToSign) {
    return aws.util.HmacSha1.encodeToString(this.secretAccessKeyId_, stringToSign);
  };
  aws.s3.S3Service.prototype.generateCanonicalizedResource_ = function(uri) {
    var canonicalizedResource, domain, queryData, subresources;
    subresources = [];
    queryData = uri.getQueryData();
    goog.array.forEach(["acl", "location", "torrent", "versionid", "versioning"], function(elem, i, arr) {
      var value;
      if (queryData.containsKey(elem)) {
        value = queryData.get(elem, null);
        if (value) {
          return subresources.push([elem, encodeURIComponent(value)].join("="));
        } else {
          return subresources.push(elem);
        }
      }
    });
    domain = uri.getDomain();
    if (domain === "s3.amazonaws.com") {
      canonicalizedResource = encodeURI(uri.getPath());
    } else if (domain.substring(domain.length - 17) === ".s3.amazonaws.com") {
      canonicalizedResource = ["/", encodeURI(domain.substring(0, domain.length - 17)), encodeURI(uri.getPath())].join('');
    } else {
      canonicalizedResource = ["/", encodeURI(domain), encodeURI(uri.getPath())].join('');
    }
    if (subresources.length) {
      canonicalizedResource = [canonicalizedResource, subresources.join('&')].join('?');
    }
    return canonicalizedResource;
  };
  aws.s3.S3Service.prototype.generateStringToSignAndDetails_ = function(uri, opt_method, opt_headers, opt_isQSA) {
    var amzHeadersArr, arrToSign, canonicalizedResource, headers, isQSA, method, queryData, signable_headers, stringToSign, theContentMD5, theContentType, theDate, theExpires;
    method = (opt_method || "GET").toUpperCase();
    isQSA = Boolean(opt_isQSA);
    headers = new goog.structs.Map(opt_headers);
    signable_headers = new goog.structs.Map();
    goog.iter.forEach(headers.getKeyIterator(), function(key, opt_undef, iter) {
      var addToMap, lowercase_key, value;
      lowercase_key = goog.string.trim(String(key)).toLowerCase();
      value = goog.string.trim(String(headers.get(key, '')));
      addToMap = false;
      if (goog.string.startsWith(lowercase_key, "x-amz-")) {
        addToMap = true;
      } else if (opt_isQSA) {} else if (lowercase_key === "date" || lowercase_key === "content-md5" || lowercase_key === "content-type") {
        addToMap = true;
      }
      if (addToMap) {
        if (signable_headers.containsKey(lowercase_key)) {
          return signable_headers.get(lowercase_key).push(String(value));
        } else {
          return signable_headers.set(lowercase_key, [String(value)]);
        }
      }
    });
    if (!signable_headers.containsKey("x-amz-date") && !signable_headers.containsKey("date")) {
      if (!isQSA) {
        headers.set("x-amz-date", new Date().toString());
        signable_headers.set("x-amz-date", headers.get("x-amz-date"));
      }
    }
    canonicalizedResource = this.generateCanonicalizedResource_(uri);
    theDate = signable_headers.get("date", []).join(',') || "";
    if (signable_headers.get("x-amz-date")) {
      theDate = "";
    }
    theContentMD5 = signable_headers.get("content-md5", []).join(',') || "";
    if (signable_headers.get("x-amz-content-md5")) {
      theContentMD5 = "";
    }
    theContentType = signable_headers.get("content-type", []).join(',') || "";
    if (signable_headers.get("x-amz-content-type")) {
      theContentType = "";
    }
    amzHeadersArr = aws.util.getAmzHeadersToSign(signable_headers);
    arrToSign;
    if (isQSA) {
      queryData = uri.getQueryData();
      theExpires = queryData.get("Expires", "") || "";
      if (signable_headers.get("x-amz-expires")) {
        theExpires = "";
      }
      arrToSign = [method, "\n", theContentMD5, "\n", theContentType, "\n", theExpires, "\n"];
    } else {
      arrToSign = [method, "\n", theContentMD5, "\n", theContentType, "\n", theDate, "\n"];
    }
    arrToSign = arrToSign.concat(amzHeadersArr).concat([canonicalizedResource]);
    stringToSign = arrToSign.join('');
    return [uri, method, headers, canonicalizedResource, amzHeadersArr, stringToSign];
  };
  aws.s3.S3Service.prototype.generateAuthorizedRequest_ = function(uri, opt_method, opt_headers, opt_isQSA) {
    var amzStringToSign, authHeaderValue, isQSA, out, outHeaders, outMethod, outUri, signature;
    isQSA = Boolean(opt_isQSA);
    out = this.generateStringToSignAndDetails_(uri, opt_method, opt_headers, opt_isQSA);
    outUri = out[0];
    outMethod = out[1];
    outHeaders = out[2];
    /*
    //var amzResource = out[3]
    //var amzHeadersArr = out[4]
    */
    amzStringToSign = out[5];
    signature = this.generateSignature(amzStringToSign);
    if (isQSA) {
      outUri.setParameterValue("AWSAccessKeyId", this.awsAccessKeyId_);
      outUri.setParameterValue("Signature", signature);
    } else {
      authHeaderValue = this.generateAuthorizationHeader(signature);
      outHeaders.set("Authorization", authHeaderValue);
    }
    return [outUri, outMethod, outHeaders];
  };
  aws.s3.S3Service.prototype.sendAuthorizedRequest = function(uri, opt_callback, opt_method, opt_headers, opt_content, opt_timeoutInterval, opt_isQSA) {
    var authRequest, the_headers, the_method, the_uri;
    authRequest = this.generateAuthorizedRequest_(uri, opt_method, opt_headers, opt_isQSA);
    the_uri = authRequest[0];
    the_method = authRequest[1];
    the_headers = authRequest[2];
    return goog.net.XhrIo.send(the_uri, opt_callback, the_method, the_headers, opt_content, opt_timeoutInterval);
  };
  aws.s3.S3Service.prototype.listMyBuckets = function(opt_callback, opt_timeoutInterval, opt_isQSA) {
    var method, uri;
    uri = new goog.Uri("http://s3.amazonaws.com/");
    method = "GET";
    return this.sendAuthorizedRequest(uri, opt_callback, method, null, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.deleteBucket = function(bucketName, opt_callback, opt_timeoutInterval, opt_isQSA) {
    var method, uri;
    uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/");
    method = "DELETE";
    return this.sendAuthorizedRequest(uri, opt_callback, method, null, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.createBucket = function(bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzAcl) {
    var headers, method, uri;
    uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/");
    method = "PUT";
    headers = null;
    if (opt_amzAcl) {
      headers = {
        "x-amz-acl": opt_amzAcl
      };
    }
    return this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.listObjects = function(bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_delimiter, opt_marker, opt_maxKeys, opt_prefix) {
    var method, uri;
    uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/");
    if (opt_delimiter) {
      uri.setParameterValue("delimiter", opt_delimiter);
    }
    if (opt_marker) {
      uri.setParameterValue("marker", opt_marker);
    }
    if (opt_maxKeys) {
      uri.setParameterValue("max-keys", opt_maxKeys);
    }
    if (opt_prefix) {
      uri.setParameterValue("prefix", opt_prefix);
    }
    method = "GET";
    return this.sendAuthorizedRequest(uri, opt_callback, method, null, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.deleteObject = function(uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzMfa) {
    var headers, method;
    method = "DELETE";
    headers = null;
    if (opt_amzMfa) {
      headers = {
        "x-amz-mfa": opt_amzMfa
      };
    }
    return this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.retrieveObject = function(uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
    var method;
    method = "GET";
    return this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.retrieveObjectMetadata = function(uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
    var method;
    method = "HEAD";
    return this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA);
  };
  aws.s3.S3Service.prototype.writeObject = function(uri, content, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
    var method;
    method = "PUT";
    return this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, content, opt_timeoutInterval, opt_isQSA);
  };
}).call(this);
