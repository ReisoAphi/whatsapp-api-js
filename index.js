const Fetch = require('./fetch').fetch;

class WhatsAppAPI {
    /**
     * Initiate the Whatsapp API app
     * 
     * @param {String} token The API token, given at setup. It can be either a temporal token or a permanent one.
     * @param {String} v The version of the API, defaults to v13.0
     */
    constructor(token, v = "v13.0") {
        this.token = token;
        this.v = v;
    }

    /**
     * Send a Whatsapp message
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} to The user's phone number
     * @param {(Text|Audio|Document|Image|Sticker|Video|Location|Contacts|Interactive)} object A Whatsapp component, built using the corresponding module for each type of message.
     * @returns {Promise} The fetch promise
     */
    sendMessage(phoneID, to, object) {
        if (!phoneID) throw new Error("Phone ID must be specified");
        if (!to) throw new Error("To must be specified");
        if (!object) throw new Error("Message must have a message object");
        return Fetch.messages(this.token, this.v, phoneID, to, object);
    }
}

module.exports = {
    WhatsApp: WhatsAppAPI,
    Handlers: require('./requests').handlers,
    Types: {
        Contacts: require('./types/contacts'),
        Location: require('./types/location'),
        Media: require('./types/media'),
        Text: require('./types/text'),
    }
};
