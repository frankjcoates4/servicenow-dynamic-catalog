function onSubmit() {
    // Async workaround. Submission will be triggered once the server call finishes
    if (g_scratchpad.isCartValid) return true;

    /**
    * Get items from each individual cart
    * Each cart represents a different class of Catalog Item, i.e., Hardware Catalog, Software Catalog, regular Catalog Items, etc
    * Each cart could also represent regular Catalog Items filtered by different conditions based on business needs
    * These fields would be list collectors to allow multiple items to be selected from each class or field
    */
    var hardware = g_form.getValue("hardware") ? g_form.getValue("hardware").split(",") : "";
    var software = g_form.getValue("software") ? g_form.getValue("software").split(",") : "";
    var other_requests = g_form.getValue("other_requests") ? g_form.getValue("other_requests").split(",") : "";

    /**
    * Build the portal cart payload to send to the server
    * Only carts with data will be added to the payload
    * This data is stored in a hidden field on the order guide
    */
    var portal_cart = []
        .concat(hardware, software, other_requests)
        .filter(cart => cart)
        .join(",");
    g_form.setValue("portal_cart", portal_cart);

    /**
    * Call the server to populate the submitter's record in the custom Portal Cart table
    * The order guide script reads this record to render items on the next screen
    * Think about it like self checkout
    */
    var cartAjax = new GlideAjax("PortalCartRenderer");
    cartAjax.addParam("sysparm_name", "createPortalCart");
    cartAjax.addParam("userSysId", g_user.userID);
    cartAjax.addParam("portalCartData", portal_cart);
    cartAjax.getXMLAnswer(answer => {
        try {
            // Handle an empty/false response
            if (!answer) {
                g_form.addErrorMessage("An error occurred while processing request. Please try again.");
                return;
            }

            // Allow submission
            var action = g_form.getActionName();
            g_scratchpad.isCartValid = true;
            g_form.submit(action);

        } catch (e) {
            var errorMsg = "An unexpected error occurred. Please try again. Error: " + e.message;
            g_form.addErrorMessage(errorMsg);
            console.error(errorMsg);
        }
    });

    // Prevent submission until successful server call finishes
    return false;
}