/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


"use strict";

// this is cut down version of micro-testpilot from
// http://hg.mozilla.org/labs/testpilot/file/tip/extension/modules/micro-testpilot.js
// (as an alternative... we could use:  https://bitbucket.org/julianceballos/sqlite-jetpack

const {Cc,Ci,Cu} = require("chrome");

const { AddonManager } = Cu.import("resource://gre/modules/AddonManager.jsm");

var _dirSvc = Cc["@mozilla.org/file/directory_service;1"]
                .getService(Ci.nsIProperties);
var _storSvc = Cc["@mozilla.org/storage/service;1"]
                 .getService(Ci.mozIStorageService);
var _prefs = Cc["@mozilla.org/preferences-service;1"]
      .getService(Ci.nsIPrefBranch);

/*
    TODO  - abstact this a bit more.  this is rough feeling
    TODO  - connections?  multiple db names?
    TODO  - replace / improve the existing sqlite implementation
*/

const STATUS_PREF_PREFIX = "extensions.testpilot.taskstatus.";
const LOCALE_PREF = "general.useragent.locale";
const UPDATE_CHANNEL_PREF = "app.update.channel";
const DATA_UPLOAD_URL = "https://testpilot.mozillalabs.com/submit/";

var dbfilename = "testpilot2";

// TODO, fix this so that it doesn't need a 'new'
var tpstore = exports.tpstore =  {

  _dbConnection:  null,

  get dbConnection() {
    console.log('getting dbConnection')
    return this._dbConnection || this.initDatabase(dbfilename);
  },

  initDatabase: function initDatabase(dbfilename) {
    var file = _dirSvc.get("ProfD", Ci.nsIFile);
    file.append(dbfilename + ".sqlite");
    // openDatabase creates the file if it's not there yet:
    var dbConnection = _storSvc.openDatabase(file);
    // Create the table if it does not exist:
    this._dbConnection = dbConnection;
    return dbConnection;
  },

  createtable:  function(tablename,fieldstatement) {
    if (! fieldstatement) fieldstatement = "jsonblob TEXT, timestamp INTEGER";
    if (! this.dbConnection.tableExists(tablename)) {
        console.log('creating!', tablename,fieldstatement);
        this.dbConnection.createTable(tablename, fieldstatement);
    };
    return this.dbConnection;
  },

  droptable:  function droptable(tablename) {
    var drop = this.dbConnection.createStatement("DROP TABLE " + tablename);
    drop.executeAsync();
    drop.finalize();
    return true;
  },

  dropdb: function dropdb() {
    // Drop table, close database connection:
    this.dbConnnection.close();

    // Delete file:
    var file = _dirSvc.get("ProfD", Ci.nsIFile);
    file.append(dbfilename + ".sqlite");
    if (file.exists) {
      file.remove();
    }
  },

  // TODO, promise?  Callback on completion?
  record: function record(object,tablename,ts,callback) {
      this.createtable(tablename);
      ts = ts || Date.now();
      var insert = "INSERT INTO " + tablename + " VALUES(?1, ?2);";
      console.log('insert:',insert);
      var insertStmt = this.dbConnection.createStatement(insert);
      insertStmt.params[0] = JSON.stringify(object);
      insertStmt.params[1] = ts;
      insertStmt.executeAsync({
        handleCompletion: function() {
            if (callback) callback();
            console.log("tpstore: insertions completed");
        }
      });
      insertStmt.finalize();
  },

  // TODO make this jetpack ok.
  // TODO refactor this!  What is actually useful here!
  // TODO this combines prefs, addons, etc.
  retrieveStudyData:  function retrieveAllData(tablename,callback) {
    console.log("tpstore: retrieval starting");
    let userData = {
      location: _prefs.getCharPref(LOCALE_PREF),
      fxVersion: Cc["@mozilla.org/xre/app-info;1"]
        .getService(Ci.nsIXULAppInfo).version,
      os: Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS,
      updateChannel: _prefs.getCharPref(UPDATE_CHANNEL_PREF)
    };
    console.log("tpstore: partial user data:", JSON.stringify(userData));

    let selectSql = "SELECT * FROM " + tablename + ";" ;
    console.log(selectSql);
    var select = this.dbConnection.createStatement(selectSql);
    var records= [];
    console.log("tpstore:", 'selecting:', selectSql);
    console.log('a select is:', typeof(select));
    //https://developer.mozilla.org/en/Storage#Asynchronously
    var studyrecords = function () select.executeAsync({
      handleResult: function(aResultSet) {
        console.log("tpstore: retrieval starting;",typeof(aResultSet));

        for (let row = aResultSet.getNextRow();
            row;
            row = aResultSet.getNextRow()) {
          //console.log("tpstore: in record", row, row.getResultByIndex(0));
          let newRecord = JSON.parse( row.getResultByIndex(0) );
          newRecord.timestamp = row.getResultByIndex(1);
          console.log("tpstore: got record", JSON.stringify(newRecord))
          records.push( newRecord );
        }
      },
      handleError: function(aError) {
        console.log("Error: ", aError.message);
      },
      handleCompletion: function(aReason) {
        if (aReason != Ci.mozIStorageStatementCallback.REASON_FINISHED)
            console.log("Query canceled or aborted!");
        console.log("tpstore: retrieval completed");
        userData.events = records;
        callback( userData );
      }
    });  // end of async

    studyrecords();

    /*
    AddonManager.getAllAddons(function(extensions) {
      userData.extensionCount = extensions.all.length;
      console.log("tpstore: extensions...", userData.extensionCount );
      let selectSql = "SELECT * FROM " + tablename;
      var select = this.dbConnection.createStatement(selectSql);
      var records= [];
      select.executeAsync({
        handleResult: function(resultSet) {
          console.log("tpstore: retrieval starting");
          for (let row = aResultSet.getNextRow(); row;
            row = aResultSet.getNextRow()) {
            let newRecord = JSON.parse( row.getUTF8string(0) );
            newRecord.timestamp = row.getDouble(1);
            records.push( newRecord );
          }
        },
        handleCompletion: function() {
          console.log("tpstore: retrieval completed");
          userData.events = records;
          callback( userData );
        }
      });

    });*/
  } // end of retrieve

};
