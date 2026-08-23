/**
 * This script will render the selected items on the order guide "Choose Options" screen.
 * There should only be one record in the portal cart table for the user, but if there are multiple records, the most recent one will be used.
 * The record is created when the user clicks "Next" on the "Describe Needs" screen.
 */
var portalCart = new GlideRecord('u_portal_cart');
portalCart.addQuery('u_user', gs.getUserID());
portalCart.orderByDesc('sys_created_on');
portalCart.setLimit(1);
portalCart.query();
if (portalCart.next()) {
    portalCart.items.split(',').forEach(item => guide.add(item));
}