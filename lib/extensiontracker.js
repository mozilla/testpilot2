/* track which extensions were installed already */

exports.installed_extensions = {};


// TODO, targetable thing with methods like 'is_safe_to_remove(extid,studid)' or such
/*

safe to uninstall:

1.  I installed it, and no one else needs it.
2.  (TBDecided) study author didn't suggest *in that study* that I be allowed to keep it?
*/