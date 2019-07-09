var accessCheckBoxes = $("#site-access-table").find('[type="checkbox"]');
$("#select-all-site-access").click(function() {
    event.preventDefault();
    accessCheckBoxes.prop("checked", true)
});
$("#select-none-site-access").click(function() {
    event.preventDefault();
    accessCheckBoxes.prop("checked", false)
});
// ----------------------------------------------------------------------
var rolesCheckBoxes = $("#site-roles-table").find('[type="checkbox"]');
$("#select-all-site-roles").click(function() {
    event.preventDefault();
    rolesCheckBoxes.prop("checked", true)
});
$("#select-none-site-roles").click(function() {
    event.preventDefault();
    rolesCheckBoxes.prop("checked", false)
});
