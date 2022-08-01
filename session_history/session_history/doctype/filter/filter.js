// Copyright (c) 2022, Devershi and contributors
// For license information, please see license.txt

frappe.ui.form.on("Filter", {
    refresh: function(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Apply Filter'), () => frm.trigger('add_filtered_emails'));
            frm.change_custom_button_type(__('Apply Filter'), null, 'success');
        }
    },
    add_filtered_emails: function(frm) {
        var doc = frm.doc;
        var email_group = doc.email_group;
        var emails = [];
        let address_filters = {};
        let session_filters = {};
        if (doc.country) address_filters.country = doc.country;
        if (doc.city) address_filters.city = doc.city;
        if (doc.intent) session_filters.intent = doc.intent;
        if (doc.package) session_filters.package = doc.package;
        if (doc.start_date && doc.end_date) {
            session_filters.datetime = [
                'between',
                [doc.start_date + ' 00:00:00', doc.end_date + ' 00:00:00']
            ];
        } else if (doc.start_date) {
            session_filters.datetime = ['>=', doc.start_date + ' 00:00:00'];
        } else if (doc.end_date) {
            session_filters.datetime = ['<=', doc.end_date + ' 00:00:00'];
        }
        let promises = [];
        if (Object.keys(address_filters).length) {
            promises.push(frappe.db.get_list('Address', {
                fields: ['email_id'],
                filters: address_filters
            }));
        }
        if (Object.keys(session_filters).length) {
            promises.push(frappe.db.get_list('Session History Collection', {
                fields: ['email'],
                filters: session_filters
            }));
        }
        if (!promises.length) return;
        (promises.length > 1 ? Promise.all(promises) : promises[0])
        .then(vals => {
            if (promises.length === 1) vals = [vals];
            $.each(vals, function(i, data) {
                $.each(data, function(i, v) {
                    var email = v.email_id || v.email;
                    if (email && emails.indexOf(email) < 0) emails.push(email);
                });
            });
            if (!emails.length) return;
            frappe.db.get_list('Email Group Member', {
                fields: ['email'],
                filters: {
                    email: ['in', emails]
                }
            }).then(data => {
                if (data.length) {
                    $.each(data, function(i, v) {
                        if (v.email) {
                            let idx = emails.indexOf(v.email);
                            if (idx >= 0) emails.splice(idx, 1);
                        }
                    });
                }
                if (!emails.length) return false;
                var chunks = [];
                if (emails.length > 200) {
                    for (var n = 0, len = emails.length; n < len; n += 200) {
                        chunks.push(emails.slice(n, n + 200));
                    }
                } else chunks.push(emails);
                for (var i = 0, l = chunks.length; i < l; i++) {
                    var docsList = [];
                    for (var x = 0, m = chunks[i].length; x < m; x++) {
                        docsList.push({
                            doctype: 'Email Group Member',
                            email_group: email_group,
                            email: chunks[i].shift(),
                        });
                    }
                    frappe.call({
        method: "frappe.client.insert_many",
        type: 'POST',
        args: {docs: docsList.slice()}
        });
                }
            });
        });
    }
});
