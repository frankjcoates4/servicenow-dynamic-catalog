var PortalCartRenderer = Class.create();
PortalCartRenderer.prototype = Object.extendsObject(globalThis.AbstractAjaxProcessor, {
    /**
     * Creates the Portal Cart used to render the selected items from order guide.
     * Called from onSubmit catalog client script Populate Portal Cart Record.
     * @param {string} userSysId - The sys_id of the user to create the portal cart for.
     * @param {string} portalCartData - comma-separated list of sys_ids of the items to add to the portal cart.
     * @returns {boolean} result - Returns true if the portal cart was created successfully, false otherwise.
     */
    createPortalCart: function () {
        // Get parameters from the client script.
        var userSysId = this.getParameter('userSysId');
        var portalCartData = this.getParameter('portalCartData');
        if (!userSysId || !portalCartData) return false;

        /**
         * Fill the item list in the Portal Cart record with the selected items from the order guide.
         * The record is matched by the user submitting the order guide.
         * This will prevent more records from being created.
         * Portal Cart is a custom table used to store the selected items from the order guide for the user.
         * This record will be read by the order guide script.
         */
        // Set the result to true initially, will be set to false if error occurs during the process.
        var result = true;

        try {
            // Look for an existing portal cart for the user.
            var portalCart = new GlideRecord('u_portal_cart');
            portalCart.addQuery('u_user', userSysId);
            portalCart.query();

            if (portalCart.next()) {
                // Portal Cart already exists for the user, update the record with the new items.
                portalCart.setValue('items', portalCartData);
                if (!portalCart.update()) {
                    result = false;
                }
            } else {
                // Portal Cart does not exist for the user, create a new record.
                portalCart.initialize();
                portalCart.setValue('u_user', userSysId);
                portalCart.setValue('items', portalCartData);
                if (!portalCart.insert()) {
                    result = false;
                }
            }
        } catch (error) {
            gs.error('Error creating/updating portal cart: ' + error.message);
            result = false;
        }

        return result;
    },

    type: 'PortalCartRenderer'
});