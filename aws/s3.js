(function() {
  /*
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
  */
  /**
   * @fileoverview Objects for communicating with Amazon S3
   *
   * @author aalok@shah.ws (Aalok Shah)
  */  var Acl, Acp, Bucket, Contents, Grant, Grantee, ListAllMyBucketsResult, ListBucketResult, LocationConstraint, Owner, Permission, S3Service, StorageClass, goog;
  goog = window.goog;
  goog.provide('aws.s3');
  goog.provide('aws.s3.Acp');
  goog.provide('aws.s3.Acl');
  goog.provide('aws.s3.Bucket');
  goog.provide('aws.s3.Contents');
  goog.provide('aws.s3.Grant');
  goog.provide('aws.s3.Grantee');
  goog.provide('aws.s3.ListAllMyBucketsResult');
  goog.provide('aws.s3.ListBucketResult');
  goog.provide('aws.s3.LocationConstraint');
  goog.provide('aws.s3.Owner');
  goog.provide('aws.s3.Permission');
  goog.provide('aws.s3.S3Service');
  goog.provide('aws.s3.StorageClass');
  goog.require('aws.util.HmacSha1');
  goog.require('goog');
  goog.require('goog.array');
  goog.require('goog.date');
  goog.require('goog.date.DateTime');
  goog.require('goog.date.UtcDateTime');
  goog.require('goog.iter');
  goog.require('goog.string');
  goog.require('goog.structs.Map');
  aws.s3.Permission = Permission = function() {
    function Permission(strValue) {
      this.strValue = strValue;
    }
    Permission.prototype.toString = function() {
      return this.strValue;
    };
    Permission.prototype.toXmlArray = function() {
      return ['<Permission>', this.strValue, '</Permission>'];
    };
    Permission.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Permission;
  }();
  aws.s3.Permission.fromXml = function(xmlElement) {
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    if (xmlElement.tagName.toLowerCase() !== 'permission') {
      return null;
    }
    return aws.s3.Permission.fromString(xmlElement.textContent);
  };
  aws.s3.Permission.READ = new aws.s3.Permission("READ");
  aws.s3.Permission.WRITE = new aws.s3.Permission("WRITE");
  aws.s3.Permission.READ_ACP = new aws.s3.Permission("READ_ACP");
  aws.s3.Permission.WRITE_ACP = new aws.s3.Permission("WRITE_ACP");
  aws.s3.Permission.FULL_CONTROL = new aws.s3.Permission("FULL_CONTROL");
  aws.s3.Permission.fromString = function(value) {
    switch (value.toUpperCase()) {
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
  aws.s3.LocationConstraint = LocationConstraint = function() {
    function LocationConstraint(strValue) {
      this.strValue = strValue;
    }
    LocationConstraint.prototype.toString = function() {
      return this.strValue;
    };
    LocationConstraint.prototype.toXmlArray = function() {
      return ['<LocationConstraint xmlns="http://s3.amazonaws.com/doc/2006-03-01/">', this.strValue, '</LocationConstraint>'];
    };
    LocationConstraint.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return LocationConstraint;
  }();
  aws.s3.LocationConstraint.EU = new aws.s3.LocationConstraint("EU");
  aws.s3.LocationConstraint.US_WEST_1 = new aws.s3.LocationConstraint("us-west-1");
  aws.s3.LocationConstraint.AP_SOUTHEAST_1 = new aws.s3.LocationConstraint("ap-southeast-1");
  aws.s3.LocationConstraint.US_CLASSIC = new aws.s3.LocationConstraint("");
  aws.s3.LocationConstraint.fromString = function(value) {
    switch (value.toLowerCase()) {
      case "eu":
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
  aws.s3.StorageClass = StorageClass = function() {
    function StorageClass(strValue) {
      this.strValue = strValue;
    }
    StorageClass.prototype.toString = function() {
      return this.strValue;
    };
    StorageClass.prototype.toXmlArray = function() {
      return ['<StorageClass>', this.strValue, '</StorageClass>'];
    };
    StorageClass.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return StorageClass;
  }();
  aws.s3.StorageClass.STANDARD = new aws.s3.StorageClass("STANDARD");
  aws.s3.StorageClass.fromString = function(value) {
    switch (value.toUpperCase()) {
      case "STANDARD":
        return aws.s3.StorageClass.STANDARD;
      default:
        return aws.s3.StorageClass.STANDARD;
    }
  };
  aws.s3.Grantee = Grantee = function() {
    function Grantee(opt_id, opt_displayName) {
      this.id = String(opt_id || "");
      this.displayName = String(opt_displayName || "");
    }
    Grantee.prototype.toXmlArray = function() {
      var arr;
      if (!this.id || !this.displayName) {
        return [];
      }
      arr = ['<Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">', '<ID>', this.id, '</ID>', '<DisplayName>', this.displayName, '</DisplayName>', '</Grantee>'];
      return arr;
    };
    Grantee.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Grantee;
  }();
  aws.s3.Grantee.fromXml = function(xmlElement) {
    var displayName, elem, id, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    id = null;
    displayName = null;
    if (xmlElement.tagName.toLowerCase() !== 'grantee') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'id':
            id = elem.textContent;
            break;
          case 'displayname':
            displayName = elem.textContent;
        }
      }
    }
    if (id || displayName) {
      return new aws.s3.Grantee(id, displayName);
    }
    return null;
  };
  aws.s3.Grant = Grant = function() {
    function Grant(opt_grantee, opt_permission) {
      this.grantee = opt_grantee || null;
      this.permission = opt_permission || 0;
    }
    Grant.prototype.toXmlArray = function() {
      if (!this.grantee || !this.permission) {
        return [];
      }
      return goog.array.flatten(['<Grant>', this.grantee.toXmlArray(), this.permission.toXmlArray(), '</Grant>']);
    };
    Grant.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Grant;
  }();
  aws.s3.Grant.fromXml = function(xmlElement) {
    var elem, grantee, permission, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    grantee = null;
    permission = null;
    if (xmlElement.tagName.toLowerCase() !== 'grant') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'grantee':
            grantee = aws.s3.Grantee.fromXml(elem);
            break;
          case 'permission':
            permission = aws.s3.Permission.fromXml(elem);
        }
      }
    }
    if (grantee || permission) {
      return new aws.s3.Grant(grantee, permission);
    }
    return null;
  };
  aws.s3.Owner = Owner = function() {
    function Owner(opt_id, opt_displayName) {
      this.id = String(opt_id || '');
      this.displayName = String(opt_displayName || '');
    }
    Owner.prototype.toXmlArray = function() {
      var arr;
      if (!this.id && !this.displayName) {
        return [];
      }
      arr = ['<Owner>'];
      if (this.id) {
        arr.concat(['<ID>', this.id, '</ID>']);
      }
      if (this.displayName) {
        arr.concat(['<DisplayName>', this.displayName, '</DisplayName>']);
      }
      arr.push('</Owner>');
      return arr;
    };
    Owner.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Owner;
  }();
  aws.s3.Owner.fromXml = function(xmlElement) {
    var displayName, elem, id, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    id = null;
    displayName = null;
    if (xmlElement.tagName.toLowerCase() !== 'owner') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'id':
            id = elem.textContent;
            break;
          case 'displayname':
            displayName = elem.textContent;
        }
      }
    }
    if (id || displayName) {
      return new aws.s3.Owner(id, displayName);
    }
    return null;
  };
  aws.s3.Acl = Acl = function() {
    function Acl(grants) {
      grants = grants || [];
      if (!goog.isArray(grants)) {
        grants = [grants];
      }
      this.grants = grants;
    }
    Acl.prototype.toXmlArray = function() {
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
    Acl.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Acl;
  }();
  aws.s3.Acl.fromXml = function(xmlElement) {
    var elem, grant, grants, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    grants = [];
    if (xmlElement.tagName.toLowerCase() !== 'accesscontrollist') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'grant':
            grant = aws.s3.Grant.fromXml(elem);
            if (grant) {
              grants.push(grant);
            }
        }
      }
    }
    if (grants.length) {
      return new aws.s3.Acl(grants);
    }
    return null;
  };
  aws.s3.Acp = Acp = function() {
    function Acp(opt_owner, opt_displayName, opt_acl) {
      this.owner = owner || null;
      this.acl = acl || null;
    }
    Acp.prototype.toXmlArray = function() {
      if (!this.owner || !this.acl) {
        return [];
      }
      return goog.array.flatten(['<AccessControlPolicy>', this.owner ? this.owner.toXmlArray() : [], this.acl ? this.acl.toXmlArray() : [], '</AccessControlPolicy>']);
    };
    Acp.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Acp;
  }();
  aws.s3.Acp.fromXml = function(xmlElement) {
    var acl, elem, owner, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    owner = null;
    acl = null;
    if (xmlElement.tagName.toLowerCase() !== 'accesscontrolpolicy') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'owner':
            owner = aws.s3.Owner.fromXml(elem);
            break;
          case 'accesscontrollist':
            acl = aws.s3.Acl.fromXml(elem);
        }
      }
    }
    if (owner || acl) {
      return new aws.s3.Acp(owner, acl);
    }
    return null;
  };
  aws.s3.Bucket = Bucket = function() {
    function Bucket(name, opt_creationDate) {
      this.name = name;
      if (opt_creationDate) {
        if (goog.isNumber(opt_creationDate)) {
          this.creationDate = goog.date.DateTime(new Date(opt_creationDate));
        } else if (goog.isString(opt_creationDate)) {
          this.creationDate = goog.date.fromIsoString(opt_creationDate);
        } else if (opt_creationDate instanceof goog.date.DateTime) {
          this.creationDate = opt_creationDate;
        } else {
          this.creationDate = null;
        }
      } else {
        this.creationDate = null;
      }
    }
    Bucket.prototype.toXmlArray = function() {
      return ['<Bucket>', '<Name>', this.name, '</Name>', '<CreationDate>', (this.creationDate ? this.creationDate.toUTCIsoString() : '0000-00-00T00:00:00.000Z'), '</CreationDate>', '</Bucket>'];
      return {
        toXml: function() {
          return this.toXmlArray().join('');
        }
      };
    };
    return Bucket;
  }();
  aws.s3.Bucket.fromXml = function(xmlElement) {
    var creationDate, elem, name, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    name = null;
    creationDate = null;
    if (xmlElement.tagName.toLowerCase() !== 'bucket') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'name':
            name = elem.textContent;
            break;
          case 'creationdate':
            creationDate = goog.date.fromIsoString(elem.textContent);
        }
      }
    }
    if (name || creationDate) {
      return new aws.s3.Bucket(name, creationDate);
    }
    return null;
  };
  aws.s3.ListAllMyBucketsResult = ListAllMyBucketsResult = function() {
    function ListAllMyBucketsResult(owner, opt_buckets) {
      this.owner = owner || null;
      if (!opt_buckets) {
        this.buckets = [];
      } else if (goog.isArray(opt_buckets)) {
        this.buckets = opt_buckets;
      } else {
        this.buckets = [opt_buckets];
      }
    }
    ListAllMyBucketsResult.prototype.toXmlArray = function() {
      var bucket, _i, _len, _ref, _results;
      return ['<ListAllMyBucketsResult xmlns="http://doc.s3.amazonaws.com/2006-03-01">'].concat((this.owner ? this.owner.toXmlArray() : [])).concat(['<Buckets>']).concat(goog.array.flatten((function() {
        _ref = this.buckets;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          bucket = _ref[_i];
          _results.push(bucket.toXmlArray());
        }
        return _results;
      }.call(this)))).concat(['</Buckets>', '</ListAllMyBucketsResult>']);
    };
    ListAllMyBucketsResult.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return ListAllMyBucketsResult;
  }();
  aws.s3.ListAllMyBucketsResults.fromXml = function(xmlElement) {
    var bucket, buckets, elem, owner, subelem, _i, _j, _len, _len2, _ref, _ref2;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    owner = null;
    buckets = [];
    if (xmlElement.tagName.toLowerCase() !== 'listallmybucketsresult') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'owner':
            owner = aws.s3.Owner.fromXml(elem);
            break;
          case 'buckets':
            _ref2 = elem.childNodes;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              subelem = _ref2[_j];
              if (subelem.nodeType === document.ELEMENT_NODE) {
                bucket = aws.s3.Bucket.fromXml(subelem);
                if (bucket) {
                  buckets.push(bucket);
                }
              }
            }
        }
      }
    }
    if (owner || buckets.length) {
      return new aws.s3.ListAllMyBucketsResults(owner, buckets);
    }
    return null;
  };
  aws.s3.Contents = Contents = function() {
    function Contents(key, opt_last_modified, opt_etag, opt_size, opt_storage_class, opt_owner) {
      this.key = key || null;
      this.last_modified = goog.isString(opt_last_modified) ? goog.date.UtcDateTime.fromIsoString(opt_last_modified) : opt_last_modified || null;
      this.etag = opt_etag || null;
      this.size = goog.isString(opt_size) ? Number(opt_size) : opt_size || null;
      this.storage_class = opt_storage_class || aws.s3.StorageClass.STANDARD;
      this.owner = opt_owner || null;
    }
    Contents.prototype.toXmlArray = function() {
      return ['<Contents>'].concat((this.key ? ['<Key>', this.key, '</Key>'] : ['<Key/>'])).concat((this.last_modified ? ['<LastModified>', this.last_modified.toXmlDateTime(true), '</LastModified>'] : ['<LastModified/>'])).concat((this.etag ? ['<ETag>', this.etag, '</ETag>'] : ['<ETag/>'])).concat((this.size !== null ? ['<Size>', String(this.size), '</Size>'] : ['<Size/>'])).concat((this.storage_class ? this.storage_class.toXmlArray() : ['<StorageClass/>'])).concat((this.owner ? this.owner.toXmlArray() : ['<Owner/>'])).concat(['</Contents>']);
    };
    Contents.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return Contents;
  }();
  aws.s3.Contents.fromXml = function(xmlElement) {
    var elem, etag, key, last_modified, owner, size, storage_class, _i, _len, _ref;
    if (!xmlElement) {
      return null;
    }
    if (goog.isString(xmlElement)) {
      xmlElement = (new DOMParser()).parseFromString(xmlElement, "text/xml").documentElement;
    }
    if (xmlElement instanceof XMLDocument) {
      xmlElement = xmlElement.documentElement;
    }
    if (!(xmlElement instanceof Element)) {
      return null;
    }
    key = null;
    last_modified = null;
    etag = null;
    size = null;
    storage_class = null;
    owner = null;
    if (xmlElement.tagName.toLowerCase() !== 'contents') {
      return null;
    }
    _ref = xmlElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      if (elem.nodeType === document.ELEMENT_NODE) {
        switch (elem.tagName.toLowerCase()) {
          case 'key':
            key = elem.textContent;
            break;
          case 'lastmodified':
            last_modified = elem.textContent;
            break;
          case 'etag':
            etag = elem.textContent;
            break;
          case 'size':
            size = elem.textContent;
            break;
          case 'storageclass':
            storage_class = aws.s3.StorageClass.fromXml(elem);
            break;
          case 'owner':
            owner = aws.s3.Owner.fromXml(elem);
        }
      }
    }
    if (key || last_modified || etag || size || storage_class || owner) {
      return new aws.s3.Contents(key, last_modified, etag, size, storage_class, owner);
    }
    return null;
  };
  aws.s3.ListBucketResult = ListBucketResult = function() {
    function ListBucketResult(name, opt_prefix, opt_marker, opt_maxKeys, opt_isTruncated, opt_contentsList) {
      this.name = name || null;
      this.prefix = opt_prefix || null;
      this.marker = opt_marker || null;
      this.maxKeys = goog.isString(opt_maxKeys) ? Number(opt_maxKeys) : opt_maxKeys || null;
      if (opt_isTruncated === true || opt_isTruncated === "true") {
        this.isTruncated = true;
      } else if (opt_isTruncated === false || opt_isTruncated === "false") {
        this.isTruncated = false;
      } else {
        this.isTruncated = null;
      }
      this.contentsList = opt_contentsList || [];
    }
    ListBucketResult.prototype.toXmlArray = function() {
      var contents, _i, _len, _ref, _results;
      return ['<ListBucketResult xmlns="http://doc.s3.amazonaws.com/2006-03-01">'].concat((this.name ? ['<Name>', this.name, '</Name>'] : ['<Name/>'])).concat((this.prefix ? ['<Prefix>', this.prefix, '</Prefix>'] : ['<Prefix/>'])).concat((this.marker ? ['<Marker>', this.marker, '</Marker>'] : ['<Marker/>'])).concat((this.maxKeys ? ['<MaxKeys>', String(this.maxKeys), '</MaxKeys>'] : ['<MaxKeys/>'])).concat((this.isTruncated !== null ? ['<IsTruncated>', String(this.isTruncated), '</IsTruncated>'] : ['<IsTruncated/>'])).concat(goog.array.flatten((function() {
        _ref = this.contentsList;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          contents = _ref[_i];
          _results.push(contents.toXmlArray());
        }
        return _results;
      }.call(this)))).concat(['</ListBucketResult>']);
    };
    ListBucketResult.prototype.toXml = function() {
      return this.toXmlArray().join('');
    };
    return ListBucketResult;
  }();
  /*
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
  */
  aws.s3.S3Service = S3Service = function() {
    function S3Service(awsAccessKeyId_, secretAccessKeyId_) {
      this.awsAccessKeyId_ = awsAccessKeyId_;
      this.secretAccessKeyId_ = secretAccessKeyId_;
    }
    S3Service.prototype.generateAuthorizationHeader = function(signature) {
      return ["AWS ", this.awsAccessKeyId_, ':', signature].join('');
    };
    S3Service.prototype.generateSignature = function(stringToSign) {
      return aws.util.HmacSha1.encodeToString(this.secretAccessKeyId_, stringToSign);
    };
    S3Service.prototype.generateCanonicalizedResource_ = function(uri) {
      var canonicalizedResource, domain, elem, queryData, subresources, value, _i, _len, _ref;
      subresources = [];
      queryData = uri.getQueryData();
      _ref = ["acl", "location", "torrent", "versionid", "versioning"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        if (queryData.containsKey(elem)) {
          value = queryData.get(elem, null);
          if (value) {
            subresources.push([elem, encodeURIComponent(value)].join("="));
          } else {
            subresources.push(elem);
          }
        }
      }
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
    S3Service.prototype.generateStringToSignAndDetails_ = function(uri, opt_method, opt_headers, opt_isQSA) {
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
    S3Service.prototype.generateAuthorizedRequest_ = function(uri, opt_method, opt_headers, opt_isQSA) {
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
    S3Service.prototype.sendAuthorizedRequest = function(uri, opt_callback, opt_method, opt_headers, opt_content, opt_timeoutInterval, opt_isQSA) {
      var authRequest, the_headers, the_method, the_uri;
      authRequest = this.generateAuthorizedRequest_(uri, opt_method, opt_headers, opt_isQSA);
      the_uri = authRequest[0];
      the_method = authRequest[1];
      the_headers = authRequest[2];
      return goog.net.XhrIo.send(the_uri, opt_callback, the_method, the_headers, opt_content, opt_timeoutInterval);
    };
    S3Service.prototype.listMyBuckets = function(opt_callback, opt_timeoutInterval, opt_isQSA) {
      var callback, method, uri;
      uri = new goog.Uri("http://s3.amazonaws.com/");
      method = "GET";
      if (opt_callback) {
        callback = function(e) {
          var obj, res, xhr;
          xhr = e.target;
          if (!xhr.isSuccess()) {
            return opt_callback.onerror(xhr);
          } else {
            obj = xhr.getResponseXml();
            res = aws.s3.ListAllMyBucketsResult.fromXml(obj);
            if (res) {
              return opt_callback.onsuccess(res);
            } else {
              return opt_callback.onerror(xhr);
            }
          }
        };
      } else {
        callback = null;
      }
      return this.sendAuthorizedRequest(uri, callback, method, null, null, opt_timeoutInterval, opt_isQSA);
    };
    S3Service.prototype.deleteBucket = function(bucketName, opt_callback, opt_timeoutInterval, opt_isQSA) {
      var callback, method, uri;
      uri = new goog.Uri("http://" + encodeURI(bucketName) + ".s3.amazonaws.com/");
      method = "DELETE";
      if (opt_callback) {
        callback = function(e) {
          var xhr;
          xhr = e.target;
          if (!xhr.isSuccess()) {
            return opt_callback.onerror(xhr);
          } else {
            return opt_callback.onsuccess(xhr.getStatus(), xhr.getResponseHeader('x-amz-id-2', 'x-amz-request-id'));
          }
        };
      } else {
        callback = null;
      }
      return this.sendAuthorizedRequest(uri, callback, method, null, null, opt_timeoutInterval, opt_isQSA);
    };
    S3Service.prototype.createBucket = function(bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzAcl) {
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
    S3Service.prototype.listObjects = function(bucketName, opt_callback, opt_timeoutInterval, opt_isQSA, opt_delimiter, opt_marker, opt_maxKeys, opt_prefix) {
      var callback, method, uri;
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
      if (opt_callback) {
        callback = function(e) {
          var obj, res, xhr;
          xhr = e.target;
          if (!xhr.isSuccess()) {
            return opt_callback.onerror(xhr);
          } else {
            obj = xhr.getResponseXml();
            res = aws.s3.ListBucketResult.fromXml(obj);
            if (res) {
              return opt_callback.onsuccess(res);
            } else {
              return opt_callback.onerror(xhr);
            }
          }
        };
      } else {
        callback = null;
      }
      return this.sendAuthorizedRequest(uri, callback, method, null, null, opt_timeoutInterval, opt_isQSA);
    };
    S3Service.prototype.deleteObject = function(uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_amzMfa) {
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
    S3Service.prototype.retrieveObject = function(uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
      var method;
      method = "GET";
      return this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA);
    };
    S3Service.prototype.retrieveObjectMetadata = function(uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
      var method;
      method = "HEAD";
      return this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, null, opt_timeoutInterval, opt_isQSA);
    };
    S3Service.prototype.writeObject = function(uri, content, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
      var method;
      method = "PUT";
      return this.sendAuthorizedRequest(uri, opt_callback, method, opt_headers, content, opt_timeoutInterval, opt_isQSA);
    };
    S3Service.prototype.copyObject = function(uri, copy_uri, opt_callback, opt_timeoutInterval, opt_isQSA, opt_headers) {
      var headers, method;
      method = "PUT";
      headers = opt_headers || {};
      headers["x-amz-copy-source"] = copy_uri;
      return this.sendAuthorizedRequest(uri, opt_callback, method, headers, null, opt_timeoutInterval, opt_isQSA);
    };
    return S3Service;
  }();
}).call(this);
