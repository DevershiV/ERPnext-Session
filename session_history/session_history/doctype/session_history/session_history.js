// Copyright (c) 2022, Devershi and contributors
// For license information, please see license.txt

function updateSession(frm) {
    if (!frm.doc.customer) return;
    let exist = [];
    if (!frm.is_new()) {
        $.each(frm.doc.session, function(i, r) { exist.push(r.sessions); });
    }
	frappe.db.get_list('Session History Collection', {
        fields: ['name'],
        filters: {name: ['like', frm.doc.customer + '%']}
    }).then(records => {
        $.each(records, function(i, r) {
            if (exist.indexOf(r.name) < 0) {
                exist.push(r.name);
                frm.add_child('session', {sessions: r.name});
            }
        });
        exist.splice(0, exist.length);
    });
}
frappe.ui.form.on('Session History', {
	refresh: function(frm) {
	    frm.add_custom_button('Update Sessions', () => { updateSession(frm); });
	},
	customer: function(frm) { updateSession(frm); }
});
