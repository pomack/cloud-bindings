###
// Copyright 2010 Cloud Bindings Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
###

###*
 * @fileoverview Objects for communicating with Amazon S3
 *
 * @author aalok@shah.ws (Aalok Shah)
###

goog = window.goog

goog.provide('aws.s3')
goog.provide('aws.s3.Acp')
goog.provide('aws.s3.Acl')
goog.provide('aws.s3.Grant')
goog.provide('aws.s3.Grantee')
goog.provide('aws.s3.LocationConstraint')
goog.provide('aws.s3.Permission')
goog.provide('aws.s3.Bucket')
goog.provide('aws.s3.S3Service')

goog.require('aws.util.HmacSha1')
goog.require('goog')
goog.require('goog.array')
goog.require('goog.iter')
goog.require('goog.string')
goog.require('goog.structs.Map')

aws.s3.Permission = (@strValue) ->

aws.s3.Permission.prototype.toString = () ->
  return this.strValue

aws.s3.Permission.prototype.toXmlArray = () ->
  return ['<Permission>', this.strValue, '</Permission>']

aws.s3.Permission.prototype.toXml = () ->
  return this.toXmlArray.join('')

aws.s3.Permission.READ = new aws.s3.Permission("READ")
aws.s3.Permission.WRITE = new aws.s3.Permission("WRITE")
aws.s3.Permission.READ_ACP = new aws.s3.Permission("READ_ACP")
aws.s3.Permission.WRITE_ACP = new aws.s3.Permission("WRITE_ACP")
aws.s3.Permission.FULL_CONTROL = new aws.s3.Permission("FULL_CONTROL")

aws.s3.Permission.fromString = (value) ->
  switch value
    when "READ" then return aws.s3.Permission.READ
    when "WRITE" then return aws.s3.Permission.WRITE
    when "READ_ACP" then return aws.s3.Permission.READ_ACP
    when "WRITE_ACP" then return aws.s3.Permission.WRITE_ACP
    when "FULL_CONTROL" then return aws.s3.Permission.FULL_CONTROL
    else return null

aws.s3.LocationConstraint = (@strValue) ->

aws.s3.LocationConstraint.prototype.toString = () ->
  return @strValue

aws.s3.LocationConstraint.prototype.toXmlArray = () ->
  return ['<LocationConstraint xmlns="http://s3.amazonaws.com/doc/2006-03-01/">', @strValue, '</LocationConstraint>']


aws.s3.LocationConstraint.prototype.toXml = () ->
  return @toXmlArray.join('')

aws.s3.LocationConstraint.EU = new aws.s3.LocationConstraint("EU")
aws.s3.LocationConstraint.US_WEST_1 = new aws.s3.LocationConstraint("us-west-1")
aws.s3.LocationConstraint.AP_SOUTHEAST_1 = new aws.s3.LocationConstraint("ap-southeast-1")
aws.s3.LocationConstraint.US_CLASSIC = new aws.s3.LocationConstraint("")

aws.s3.LocationConstraint.fromString = (value) ->
  switch value
    when "EU" then return aws.s3.LocationConstraint.EU
    when "us-west-1" then return aws.s3.LocationConstraint.US_WEST_1
    when "ap-southeast-1" then return aws.s3.LocationConstraint.AP_SOUTHEAST_1
    when "" then return aws.s3.LocationConstraint.US_CLASSIC
    else return aws.s3.LocationConstraint.US_CLASSIC

aws.s3.Grantee = (opt_id, opt_displayName) ->
  @id = String(id or "")
  @displayName = String(displayName or "")


aws.s3.Grantee.prototype.toXmlArray = () ->
  if not this.id or not this.displayName
    return []
  arr = [
    '<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">',
      '<ID>', @id, '</ID>',
      '<DisplayName>', @displayName, '</DisplayName>',
    '</Grantee>'
  ]
  return arr

aws.s3.Grantee.prototype.toXml = () ->
  return @toXmlArray.join('')

aws.s3.Grant = (opt_grantee, opt_permission) ->
  @grantee = opt_grantee or null
  @permission = opt_permission or 0

aws.s3.Grant.prototype.toXmlArray = (opt_asStringArray) ->
  if not this.grantee or not this.permission
    return []
  return goog.array.flatten([
    '<Grant>',
      @grantee.toXmlArray(),
      @permission.toXmlArray(),
    '</Grant>'
  ])

aws.s3.Grant.prototype.toXml = () ->
  return @toXmlArray.join('')

aws.s3.Acl = (grants) ->
  grants = grants or []
  if not goog.isArray(grants)
    grants = [grants]
  @grants = grants

aws.s3.Acl.prototype.toXmlArray = () ->
  if @grants.length <= 0
    return if opt_asStringArray then [] else ""
  return goog.array.flatten([
    '<AccessControlList>',
      goog.array.map(@grants, 
        (elem, i, arr2) ->
          return elem.toXmlArray()
      ),
    '</AccessControlList>'
  ])

aws.s3.Acl.prototype.toXml = () ->
  return this.toXmlArray.join('')

aws.s3.Acp = (owner, acl) ->
  this.owner = owner or null
  this.acl = acl or null

aws.s3.Acp.prototype.toXml = (opt_asStringArray) ->
  if not this.owner or not this.acl
    return []
  return goog.array.flatten([
    '<AccessControlPolicy>',
      '<Owner>',
        '<ID>',
          @owner.id,
        '</ID>',
        '<DisplayName>',
          @owner.displayName,
        '</DisplayName>',
      '</Owner>',
      if @acl then @acl.toXmlArray() else [],
    '</AccessControlPolicy>'
  ])

aws.s3.Acp.prototype.toXml = () ->
  return this.toXmlArray.join('')

aws.s3.S3Service = (awsAccessKeyId, secretAccessKeyId) ->
  @awsAccessKeyId_ = awsAccessKeyId
  @secretAccessKeyId_ = secretAccessKeyId

aws.s3.S3Service.prototype.generateAuthorizationHeader = (signature) ->
  return ["AWS ", @awsAccessKeyId_, ':', signature].join('')

aws.s3.S3Service.prototype.generateSignature = (stringToSign) ->
  return aws.util.HmacSha1.encodeToString(@secretAccessKeyId_, stringToSign)

aws.s3.S3Service.prototype.generateCanonicalizedResource_ = (uri) ->
  subresources = []
  queryData = uri.getQueryData()
  goog.array.forEach(["acl", "location", "torrent", "versionid", "versioning"],
    (elem, i, arr) ->
      if queryData.containsKey(elem)
        value = queryData.get(elem, null)
        if value
          subresources.push([elem, encodeURIComponent(value)].join("="))
        else
          subresources.push(elem)
  )
  
  domain = uri.getDomain()
  if domain == "s3.amazonaws.com"
    canonicalizedResource = encodeURI(uri.getPath())
  else if domain.substring(domain.length-17) == ".s3.amazonaws.com"
    canonicalizedResource = ["/", encodeURI(domain.substring(0, domain.length-17)), encodeURI(uri.getPath())].join('')
  else
    canonicalizedResource = ["/", encodeURI(domain), encodeURI(uri.getPath())].join('')
  if subresources.length
    canonicalizedResource = [canonicalizedResource, subresources.join('&')].join('?')
  return canonicalizedResource

aws.s3.S3Service.prototype.generateStringToSignAndDetails_ = (uri, opt_method, opt_headers, opt_isQSA) ->
  method = (opt_method or "GET").toUpperCase()
  isQSA = Boolean(opt_isQSA)
  headers = new goog.structs.Map(opt_headers)
  signable_headers = new goog.structs.Map()
  goog.iter.forEach(headers.getKeyIterator(),
    (key, opt_undef, iter) ->
      lowercase_key = goog.string.trim(String(key)).toLowerCase()
      value = goog.string.trim(String(headers.get(key, '')))
      addToMap = false
      if goog.string.startsWith(lowercase_key, "x-amz-")
        addToMap = true
      else if opt_isQSA
      else if lowercase_key == "date" || lowercase_key == "content-md5" || lowercase_key == "content-type"
        addToMap = true
      if addToMap
        if signable_headers.containsKey(lowercase_key)
          signable_headers.get(lowercase_key).push(String(value))
        else
          signable_headers.set(lowercase_key, [String(value)])
  )
  if not signable_headers.containsKey("x-amz-date") and not signable_headers.containsKey("date")
    if not isQSA
      headers.set("x-amz-date", new Date().toString())
      signable_headers.set("x-amz-date", headers.get("x-amz-date"))
  canonicalizedResource = this.generateCanonicalizedResource_(uri)
  theDate = signable_headers.get("date", []).join(',') or ""
  if signable_headers.get("x-amz-date")
    theDate = ""
  theContentMD5 = signable_headers.get("content-md5", []).join(',') or ""
  if signable_headers.get("x-amz-content-md5")
    theContentMD5 = ""
  theContentType = signable_headers.get("content-type", []).join(',') or ""
  if signable_headers.get("x-amz-content-type")
    theContentType = ""
  
  amzHeadersArr = aws.util.getAmzHeadersToSign(signable_headers)
  arrToSign
  if isQSA
    queryData = uri.getQueryData()
    theExpires = queryData.get("Expires", "") or ""
    if signable_headers.get("x-amz-expires")
      theExpires = ""
    arrToSign = [
      method, "\n", 
      theContentMD5, "\n",
      theContentType, "\n",
      theExpires, "\n"
    ]
  else
    arrToSign = [
      method, "\n", 
      theContentMD5, "\n",
      theContentType, "\n",
      theDate, "\n"
    ]
  arrToSign = arrToSign.concat(amzHeadersArr).concat([canonicalizedResource])
  stringToSign = arrToSign.join('')
  return [uri, method, headers, canonicalizedResource, amzHeadersArr, stringToSign]

aws.s3.S3Service.prototype.generateAuthorizedRequest_ = (uri, opt_method, opt_headers, opt_isQSA) ->
  isQSA = Boolean(opt_isQSA)
  out = this.generateStringToSignAndDetails_(uri, opt_method, opt_headers, opt_isQSA)
  outUri = out[0]
  outMethod = out[1]
  outHeaders = out[2]
  ###
  //var amzResource = out[3]
  //var amzHeadersArr = out[4]
  ###
  amzStringToSign = out[5]
  signature = this.generateSignature(amzStringToSign)
  if isQSA
    outUri.setParameterValue("AWSAccessKeyId", this.awsAccessKeyId_)
    outUri.setParameterValue("Signature", signature)
  else
    authHeaderValue = this.generateAuthorizationHeader(signature)
    outHeaders.set("Authorization", authHeaderValue)
  return [outUri, outMethod, outHeaders]

aws.s3.S3Service.prototype.sendAuthorizedRequest = (uri, opt_callback, opt_method, opt_headers, opt_content, opt_timeoutInterval, opt_isQSA) ->
  authRequest = this.generateAuthorizedRequest_(uri, opt_method, opt_headers, opt_isQSA)
  the_uri = authRequest[0]
  the_method = authRequest[1]
  the_headers = authRequest[2]
  goog.net.XhrIo.send(the_uri, opt_callback, the_method, the_headers, opt_content, opt_timeoutInterval)

aws.s3.S3Service.prototype.listMyBuckets = (opt_callback, opt_timeoutInterval, opt_isQSA) ->
  uri = new goog.Uri("http://s3.amazonaws.com/")
  method = "GET"
  this.sendAuthorizedRequest(uri, opt_callback, method, null, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.deleteBucket = (bucketName, opt_callback, opt_timeoutInterval, opt_isQSA) ->
  uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/")
  method = "DELETE"
  this.sendAuthorizedRequest(uri, opt_callback, method, null, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.createBucket = (bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzAcl) ->
  uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/")
  method = "PUT"
  headers = null
  if opt_amzAcl
    headers = {
      "x-amz-acl" : opt_amzAcl
    }
  this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.listObjects = (bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_delimiter, opt_marker, opt_maxKeys, opt_prefix) ->
  uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/")
  if opt_delimiter
    uri.setParameterValue("delimiter", opt_delimiter)
  if opt_marker
    uri.setParameterValue("marker", opt_marker)
  if opt_maxKeys
    uri.setParameterValue("max-keys", opt_maxKeys)
  if opt_prefix
    uri.setParameterValue("prefix", opt_prefix)
  method = "GET"
  this.sendAuthorizedRequest(uri, opt_callback, method, null, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.deleteObject = (uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzMfa) ->
  method = "DELETE"
  headers = null
  if opt_amzMfa
    headers = {
      "x-amz-mfa" : opt_amzMfa
    }
  this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.retrieveObject = (uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
  method = "GET"
  this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.retrieveObjectMetadata = (uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
  method = "HEAD"
  this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA)

aws.s3.S3Service.prototype.writeObject = (uri, content, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
  method = "PUT"
  this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, content, opt_timeoutInterval, opt_isQSA)










