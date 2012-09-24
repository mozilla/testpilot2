// complete <- uploaded <- askupload <- done <- install <- askinstall <- NEW
let STATUS = exports.STATUS = {
    NEW: "NEW",
    ASKINSTALL:  "ASKINSTALL",
    INSTALL:  "INSTALL",
    COLLECTING:  "COLLECTING",
    ASKUPLOAD: "ASKUPLOAD",
    UPLOAD:  "UPLOAD",
    COMPLETE:  "COMPLETE",
    ERROR:  "ERROR",
    REFUSED:  "REFUSED",
    IGNORED:  "IGNORED",
    ABANDONED:  "ABANDONED"
};
