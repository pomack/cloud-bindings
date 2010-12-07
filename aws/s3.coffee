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
goog.provide('aws.s3.Bucket')
goog.provide('aws.s3.Contents')
goog.provide('aws.s3.Grant')
goog.provide('aws.s3.Grantee')
goog.provide('aws.s3.ListAllMyBucketsResult')
goog.provide('aws.s3.ListBucketResult')
goog.provide('aws.s3.LocationConstraint')
goog.provide('aws.s3.Owner')
goog.provide('aws.s3.Permission')
goog.provide('aws.s3.S3Service')
goog.provide('aws.s3.StorageClass')

goog.require('aws.util.HmacSha1')
goog.require('goog')
goog.require('goog.array')
goog.require('goog.date')
goog.require('goog.date.DateTime')
goog.require('goog.iter')
goog.require('goog.string')
goog.require('goog.structs.Map')

class aws.s3.Permission
  constructor: (@strValue) ->
    
  toString: () ->
    @strValue
  
  toXmlArray: () ->
    return ['<Permission>', this.strValue, '</Permission>']
    
  toXml: () ->
    return @toXmlArray().join('')
  
aws.s3.Permission.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  if xmlElement.tagName.toLowerCase() != 'permission'
    return null
  return aws.s3.Permission.fromString(xmlElement.textContent)

aws.s3.Permission.READ = new aws.s3.Permission("READ")
aws.s3.Permission.WRITE = new aws.s3.Permission("WRITE")
aws.s3.Permission.READ_ACP = new aws.s3.Permission("READ_ACP")
aws.s3.Permission.WRITE_ACP = new aws.s3.Permission("WRITE_ACP")
aws.s3.Permission.FULL_CONTROL = new aws.s3.Permission("FULL_CONTROL")

aws.s3.Permission.fromString = (value) ->
  switch value.toUpperCase()
    when "READ" then return aws.s3.Permission.READ
    when "WRITE" then return aws.s3.Permission.WRITE
    when "READ_ACP" then return aws.s3.Permission.READ_ACP
    when "WRITE_ACP" then return aws.s3.Permission.WRITE_ACP
    when "FULL_CONTROL" then return aws.s3.Permission.FULL_CONTROL
    else return null

class aws.s3.LocationConstraint
  constructor: (@strValue) ->
    
  toString: () ->
    return @strValue

  toXmlArray: () ->
    return ['<LocationConstraint xmlns="http://s3.amazonaws.com/doc/2006-03-01/">', @strValue, '</LocationConstraint>']

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.LocationConstraint.EU = new aws.s3.LocationConstraint("EU")
aws.s3.LocationConstraint.US_WEST_1 = new aws.s3.LocationConstraint("us-west-1")
aws.s3.LocationConstraint.AP_SOUTHEAST_1 = new aws.s3.LocationConstraint("ap-southeast-1")
aws.s3.LocationConstraint.US_CLASSIC = new aws.s3.LocationConstraint("")

aws.s3.LocationConstraint.fromString = (value) ->
  switch value.toLowerCase()
    when "eu" then return aws.s3.LocationConstraint.EU
    when "us-west-1" then return aws.s3.LocationConstraint.US_WEST_1
    when "ap-southeast-1" then return aws.s3.LocationConstraint.AP_SOUTHEAST_1
    when "" then return aws.s3.LocationConstraint.US_CLASSIC
    else return aws.s3.LocationConstraint.US_CLASSIC

class aws.s3.StorageClass
  constructor: (@strValue) ->

  toString: () ->
    return @strValue

  toXmlArray: () ->
    return ['<StorageClass>', @strValue, '</StorageClass>']

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.StorageClass.STANDARD = new aws.s3.StorageClass("STANDARD")

aws.s3.StorageClass.fromString = (value) ->
  switch value.toUpperCase()
    when "STANDARD" then return aws.s3.StorageClass.STANDARD
    else return aws.s3.StorageClass.STANDARD

class aws.s3.Grantee
  constructor: (opt_id, opt_displayName) ->
    @id = String(opt_id or "")
    @displayName = String(opt_displayName or "")

  toXmlArray: () ->
    if not @id or not @displayName
      return []
    arr = [
      '<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">',
        '<ID>', @id, '</ID>',
        '<DisplayName>', @displayName, '</DisplayName>',
      '</Grantee>'
    ]
    return arr

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.Grantee.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  id = null
  displayName = null
  if xmlElement.tagName.toLowerCase() != 'grantee'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'id' then id = elem.textContent
        when 'displayname' then displayName = elem.textContent
  if id or displayName
    return new aws.s3.Grantee(id, displayName)
  return null

class aws.s3.Grant
  constructor: (opt_grantee, opt_permission) ->
    @grantee = opt_grantee or null
    @permission = opt_permission or 0

  toXmlArray: () ->
    if not this.grantee or not this.permission
      return []
    return goog.array.flatten([
      '<Grant>',
        @grantee.toXmlArray(),
        @permission.toXmlArray(),
      '</Grant>'
    ])

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.Grant.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  grantee = null
  permission = null
  if xmlElement.tagName.toLowerCase() != 'grant'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'grantee' then grantee = aws.s3.Grantee.fromXml(elem)
        when 'permission' then permission = aws.s3.Permission.fromXml(elem)
  if grantee or permission
    return new aws.s3.Grant(grantee, permission)
  return null

class aws.s3.Owner
  constructor: (opt_id, opt_displayName) ->
    @id = String(opt_id or '')
    @displayName = String(opt_displayName or '')
  
  toXmlArray: () ->
    if not @id and not @displayName
      return []
    arr = ['<Owner>']
    arr.concat(['<ID>', @id, '</ID>']) if @id
    arr.concat(['<DisplayName>', @displayName, '</DisplayName>']) if @displayName
    arr.push('</Owner>')
    return arr
  
  toXml: () ->
    return @toXmlArray().join('')

aws.s3.Owner.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  id = null
  displayName = null
  if xmlElement.tagName.toLowerCase() != 'owner'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'id' then id = elem.textContent
        when 'displayname' then displayName = elem.textContent
  if id or displayName
    return new aws.s3.Owner(id, displayName)
  return null

class aws.s3.Acl
  constructor: (grants) ->
    grants = grants or []
    if not goog.isArray(grants)
      grants = [grants]
    @grants = grants

  toXmlArray: () ->
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

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.Acl.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  grants = []
  if xmlElement.tagName.toLowerCase() != 'accesscontrollist'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'grant'
          grant = aws.s3.Grant.fromXml(elem)
          if grant
            grants.push(grant)
  if grants.length
    return new aws.s3.Acl(grants)
  return null

class aws.s3.Acp
  constructor: (opt_owner, opt_displayName, opt_acl) ->
    @owner = owner or null
    @acl = acl or null

  toXmlArray: () ->
    if not @owner or not @acl
      return []
    return goog.array.flatten([
      '<AccessControlPolicy>',
        if @owner then @owner.toXmlArray() else [],
        if @acl then @acl.toXmlArray() else [],
      '</AccessControlPolicy>'
    ])

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.Acp.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  owner = null
  acl = null
  if xmlElement.tagName.toLowerCase() != 'accesscontrolpolicy'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'owner' then owner = aws.s3.Owner.fromXml(elem)
        when 'accesscontrollist' then acl = aws.s3.Acl.fromXml(elem)
  if owner or acl
    return new aws.s3.Acp(owner, acl)
  return null

class aws.s3.Bucket
  constructor: (@name, opt_creationDate) ->
    if opt_creationDate
      if goog.isNumber(opt_creationDate)
        @creationDate = goog.date.DateTime(new Date(opt_creationDate))
      else if goog.isString(opt_creationDate)
        @creationDate = goog.date.fromIsoString(opt_creationDate)
      else if opt_creationDate instanceof goog.date.DateTime
        @creationDate = opt_creationDate
      else
        @creationDate = null
    else
      @creationDate = null
  
  toXmlArray: () ->
    return [
      '<Bucket>',
        '<Name>', @name, '</Name>',
        '<CreationDate>', (if @creationDate then @creationDate.toUTCIsoString() else '0000-00-00T00:00:00.000Z'), '</CreationDate>',
      '</Bucket>'
    ]

    toXml: () ->
      return @toXmlArray().join('')
    
aws.s3.Bucket.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  name = null
  creationDate = null
  if xmlElement.tagName.toLowerCase() != 'bucket'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'name' then name = elem.textContent
        when 'creationdate' then creationDate = goog.date.fromIsoString(elem.textContent)
  if name or creationDate
    return new aws.s3.Bucket(name, creationDate)
  return null

class aws.s3.ListAllMyBucketsResult
  constructor: (owner, opt_buckets) ->
    @owner = owner or null
    if not opt_buckets
      @buckets = []
    else if goog.isArray(opt_buckets)
      @buckets = opt_buckets
    else
      @buckets = [opt_buckets]
  
  toXmlArray: () ->
    return [
      '<ListAllMyBucketsResult xmlns="http://doc.s3.amazonaws.com/2006-03-01">'
    ].concat((if @owner then @owner.toXmlArray() else [
    ])).concat([
      '<Buckets>'
    ]).concat(goog.array.flatten((bucket.toXmlArray() for bucket in @buckets))).concat([
        '</Buckets>',
      '</ListAllMyBucketsResult>'
    ])
  
  toXml: () ->
    return @toXmlArray().join('')
  
aws.s3.ListAllMyBucketsResults.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  owner = null
  buckets = []
  if xmlElement.tagName.toLowerCase() != 'listallmybucketsresult'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'owner' then owner = aws.s3.Owner.fromXml(elem)
        when 'buckets'
          for subelem in elem.childNodes
            if subelem.nodeType == document.ELEMENT_NODE
              bucket = aws.s3.Bucket.fromXml(subelem)
              if bucket
                buckets.push(bucket)
  if owner or buckets.length
    return new aws.s3.ListAllMyBucketsResults(owner, buckets)
  return null

class aws.s3.Contents
  constructor: (key, opt_last_modified, opt_etag, opt_size, opt_storage_class, opt_owner) ->
    @key = key or null
    @last_modified = if goog.isString(opt_last_modified) then goog.date.UtcDateTime.fromIsoString(opt_last_modified) else opt_last_modified or null
    @etag = opt_etag or null
    @size = if goog.isString(opt_size) then Number(opt_size) else opt_size or null
    @storage_class = opt_storage_class or aws.s3.StorageClass.STANDARD
    @owner = opt_owner or null

  toXmlArray: () ->
    return [
      '<Contents>',
    ].concat((if @key then ['<Key>', @key, '</Key>'] else ['<Key/>'
    ])).concat((if @last_modified then ['<LastModified>', @last_modified.toXmlDateTime(true), '</LastModified>'] else ['<LastModified/>'
    ])).concat((if @etag then ['<ETag>', @etag, '</ETag>']  else ['<ETag/>'
    ])).concat((if @size != null then ['<Size>', String(@size), '</Size>'] else ['<Size/>'
    ])).concat((if @storage_class then @storage_class.toXmlArray() else ['<StorageClass/>'
    ])).concat((if @owner then @owner.toXmlArray() else ['<Owner/>'
    ])).concat([
      '</Contents>'
    ])

  toXml: () ->
    return @toXmlArray().join('')

aws.s3.Contents.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  key = null
  last_modified = null
  etag = null
  size = null
  storage_class = null
  owner = null
  if xmlElement.tagName.toLowerCase() != 'contents'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'key' then key = elem.textContent
        when 'lastmodified' then last_modified = elem.textContent
        when 'etag' then etag = elem.textContent
        when 'size' then size = elem.textContent
        when 'storageclass' then storage_class = aws.s3.StorageClass.fromXml(elem)
        when 'owner' then owner = aws.s3.Owner.fromXml(elem)
  if key or last_modified or etag or size or storage_class or owner
    return new aws.s3.Contents(key, last_modified, etag, size, storage_class, owner)
  return null


class aws.s3.ListBucketResult
  constructor: (name, opt_prefix, opt_marker, opt_maxKeys, opt_isTruncated, opt_contentsList) ->
    @name = name or null
    @prefix = opt_prefix or null
    @marker = opt_marker or null
    @maxKeys = if goog.isString(opt_maxKeys) then Number(opt_maxKeys) else opt_maxKeys or null
    if opt_isTruncated == true or opt_isTruncated == "true"
      @isTruncated = true
    else if opt_isTruncated == false or opt_isTruncated == "false"
      @isTruncated = false
    else
      @isTruncated = null
    @contentsList = opt_contentsList or []
  
  toXmlArray: () ->
    return [
      '<ListBucketResult xmlns="http://doc.s3.amazonaws.com/2006-03-01">'
    ].concat((if @name then ['<Name>', @name, '</Name>'] else ['<Name/>'
    ])).concat((if @prefix then ['<Prefix>', @prefix, '</Prefix>'] else ['<Prefix/>'
    ])).concat((if @marker then ['<Marker>', @marker, '</Marker>'] else ['<Marker/>'
    ])).concat((if @maxKeys then ['<MaxKeys>', String(@maxKeys), '</MaxKeys>'] else ['<MaxKeys/>'
    ])).concat((if @isTruncated != null then ['<IsTruncated>', String(@isTruncated), '</IsTruncated>'] else ['<IsTruncated/>'
    ])).concat(goog.array.flatten((contents.toXmlArray() for contents in @contentsList))).concat([
      '</ListBucketResult>'
    ])

  toXml: () ->
    return @toXmlArray().join('')
###
aws.s3.ListBucketResult.fromXml = (xmlElement) ->
  if not xmlElement
    return null
  if goog.isString(xmlElement)
    xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement
  if xmlElement instanceof XMLDocument
    xmlElement = xmlElement.documentElement
  if xmlElement not instanceof Element
    return null
  name = null
  prefix = null
  marker = null
  maxKeys = null
  isTruncated = null
  contentsList = []
  if xmlElement.tagName.toLowerCase() != 'listbucketresult'
    return null
  for elem in xmlElement.childNodes
    if elem.nodeType == document.ELEMENT_NODE
      switch elem.tagName.toLowerCase()
        when 'name' then name = elem.textContent
        when 'prefix' then prefix = elem.textContent
        when 'marker' then marker = elem.textContent
        when 'istruncated' then isTruncated = elem.textContent
        when 'contents' then
          contents = aws.s3.Contents.fromXml(elem)
          if contents != null
            contentsList.push(contents)
  if name or prefix or marker or maxKeys or isTruncated or contentsList.length
    return new aws.s3.ListBucketResults(name, prefix, marker, maxKeys, isTruncated, contentsList)
  return null
###

class aws.s3.S3Service
  constructor: (@awsAccessKeyId_, @secretAccessKeyId_) ->

  generateAuthorizationHeader: (signature) ->
    return ["AWS ", @awsAccessKeyId_, ':', signature].join('')

  generateSignature: (stringToSign) ->
    return aws.util.HmacSha1.encodeToString(@secretAccessKeyId_, stringToSign)

  generateCanonicalizedResource_: (uri) ->
    subresources = []
    queryData = uri.getQueryData()
    for elem in ["acl", "location", "torrent", "versionid", "versioning"]
      if queryData.containsKey(elem)
        value = queryData.get(elem, null)
        if value
          subresources.push([elem, encodeURIComponent(value)].join("="))
        else
          subresources.push(elem)
    
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

  generateStringToSignAndDetails_: (uri, opt_method, opt_headers, opt_isQSA) ->
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

  generateAuthorizedRequest_: (uri, opt_method, opt_headers, opt_isQSA) ->
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

  sendAuthorizedRequest: (uri, opt_callback, opt_method, opt_headers, opt_content, opt_timeoutInterval, opt_isQSA) ->
    authRequest = this.generateAuthorizedRequest_(uri, opt_method, opt_headers, opt_isQSA)
    the_uri = authRequest[0]
    the_method = authRequest[1]
    the_headers = authRequest[2]
    goog.net.XhrIo.send(the_uri, opt_callback, the_method, the_headers, opt_content, opt_timeoutInterval)

  listMyBuckets: (opt_callback, opt_timeoutInterval, opt_isQSA) ->
    uri = new goog.Uri("http://s3.amazonaws.com/")
    method = "GET"
    if opt_callback
      callback = (e) ->
        xhr = e.target
        if not xhr.isSuccess()
          opt_callback.onerror(xhr)
        else
          obj = xhr.getResponseXml()
          res = aws.s3.ListAllMyBucketsResult.fromXml(obj)
          if res
            opt_callback.onsuccess(res)
          else
            opt_callback.onerror(xhr)
    else
      callback = null
    this.sendAuthorizedRequest(uri, callback, method, null, null, opt_timeoutInterval, opt_isQSA)

  deleteBucket: (bucketName, opt_callback, opt_timeoutInterval, opt_isQSA) ->
    uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/")
    method = "DELETE"
    if opt_callback
      callback = (e) ->
        xhr = e.target
        if not xhr.isSuccess()
          opt_callback.onerror(xhr)
        else
          opt_callback.onsuccess(xhr.getStatus(), xhr.getResponseHeader('x-amz-id-2', 'x-amz-request-id'))
    else
      callback = null
    this.sendAuthorizedRequest(uri, callback, method, null, null, opt_timeoutInterval, opt_isQSA)

  createBucket: (bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzAcl) ->
    uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/")
    method = "PUT"
    headers = null
    if opt_amzAcl
      headers = {
        "x-amz-acl" : opt_amzAcl
      }
    this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA)

  listObjects: (bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_delimiter, opt_marker, opt_maxKeys, opt_prefix) ->
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
    if opt_callback
      callback = (e) ->
        xhr = e.target
        if not xhr.isSuccess()
          opt_callback.onerror(xhr)
        else
          obj = xhr.getResponseXml()
          res = aws.s3.ListBucketResult.fromXml(obj)
          if res
            opt_callback.onsuccess(res)
          else
            opt_callback.onerror(xhr)
    else
      callback = null
    this.sendAuthorizedRequest(uri, callback, method, null, null, opt_timeoutInterval, opt_isQSA)

  deleteObject: (uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzMfa) ->
    method = "DELETE"
    headers = null
    if opt_amzMfa
      headers = {
        "x-amz-mfa" : opt_amzMfa
      }
    this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA)

  retrieveObject: (uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
    method = "GET"
    this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA)

  retrieveObjectMetadata: (uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
    method = "HEAD"
    this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA)

  writeObject: (uri, content, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
    method = "PUT"
    this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, content, opt_timeoutInterval, opt_isQSA)
  
  copyObject: (uri, copy_uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) ->
    method = "PUT"
    headers = opt_headers or {}
    headers["x-amz-copy-source"] = copy_uri
    this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA)










