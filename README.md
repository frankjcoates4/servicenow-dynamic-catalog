# servicenow-dynamic-catalog
A lightweight, high-performance JavaScript solution for ServiceNow designed to dynamically evaluate, filter, and render Service Catalog items in real time based on user input within an Order Guide.

## The Business Problem
Standard ServiceNow Order Guides typically rely on fixed, static rule bases to determine which catalog items appear. In complex enterprise environments, this creates rigid user journeys and cluttered forms. 

This solution replaces heavy, synchronous client-side processing with an asynchronous, data-driven architecture. It evaluates user inputs dynamically. This reduces form layout fatigue and delivers a faster, cleaner employee experience.

## Use Case
This solution can be used for requesting anything in the catalog that an onboarding employee may need. It removes the need for setting up rule bases or submitting individual items.

## 🛠️ Technical Architecture & Components
This solution is built using modular, platform-native artifacts to ensure scalability and easy maintenance:

*   **Client Script (onChange and onSubmit):** Listens for user selections on the Order Guide variables. It bundles inputs into a clean data package.
*   **GlideAjax API Integration:** Routes data to the backend asynchronously. This keeps the browser responsive and prevents screen freezes.
*   **Script Include (Server-Side):** Acts as a centralized controller. It queries catalog definition rules using optimized data structures.
*   **Custom Portal Cart Table:** A custom cart-style table used as a container for the requested catalog items
*   **Order Guide Script:** Renders the items in the cart to display the items in the portal

## Code Highlights

### Client Script (onSubmit) - Populate Portal Cart Record
This script processes the client payload asynchronously. It uses platform APIs to safely populate the custom portal cart records without slowing down the system:

```javascript
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
```

### Key Practices Demonstrated:
*   **Error Handling:** Uses strict `try...catch` blocks to protect the user experience from unexpected payload/response formats.
*   **Performance Optimization:** Keeps script processing asynchronous to prevent blocking client interface. Re-triggers submission automatically after server call finishes.
*   **Data Security:** Relies entirely on secure parameters instead of risky client-side evaluation blocks. Complex logic is handled server-side.
*   **Scalability:** Multiple fields can be used with different filters to suit business needs

## Deployment & Configuration
This utility is designed for standard cross-environment deployments:

1.  **Importing Code:** Bring the components into your sub-production instance using a standard **ServiceNow Update Set XML** or via source control integration.
2.  **Variable Connection:** Add the specific script triggers to your target order guide canvas. An order guide script is needed to process the Portal Cart record.

## ServiceNow Certifications
I actively maintain official, verifiable ServiceNow credentials to ensure my development practices align with current platform standards:

*   **[ServiceNow Certified System Administrator (CSA)] - (https://www.credly.com/badges/e1e3ca46-a42d-4826-8052-9f862448d6c9/public_url)**
*   **[ServiceNow Certified Application Developer (CAD)] - (https://www.credly.com/badges/2f65ca0e-6a6c-4754-a48f-1bd1bd998cb8/public_url)**
*   **[ServiceNow Certified Implementation Specialist - Data Foundations (CMDB and CSDM) (CIS-DF(CMDB and CSDM))] - (https://www.credly.com/badges/51b46f8a-7f37-4acb-9040-baea950b20ff/public_url)**
