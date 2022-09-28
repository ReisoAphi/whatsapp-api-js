// Most of these imports are here only for types checks

const { Contacts } = require('./types/contacts');
const { Interactive } = require("./types/interactive");
const { Audio, Document, Image, Sticker, Video } = require('./types/media');
const Location = require('./types/location');
const { Template } = require('./types/template');
const Text = require('./types/text');

const api = require('./fetch');
const { Request } = api;

/**
 * The main API object
 * 
 * @property {String} token The API token
 * @property {String} v The API version to use
 * @property {Boolean} parsed If truthy, API operations will return the fetch promise instead. Intended for low level debugging.
 */
class WhatsAppAPI {
    /**
     * Initiate the Whatsapp API app
     * 
     * @param {String} token The API token, given at setup. It can be either a temporal token or a permanent one.
     * @param {String} v The version of the API, defaults to v14.0
     * @param {Boolean} parsed Whether to return a pre-processed response from the API or the raw fetch response. Intended for low level debugging.
     * @throws {Error} If token is not specified
     */
    constructor(token, v = "v15.0", parsed = true) {
        if (!token) throw new Error("Token must be specified");
        this.token = token;
        this.v = v;
        this.parsed = !!parsed;
    }
    
    /**
     * Callback function after a sendMessage request is sent
     *
     * @callback Logger
     * @param {String} phoneID The bot's phoneID from where the message was sent
     * @param {String} to The user's phone number
     * @param {(Text|Audio|Document|Image|Sticker|Video|Location|Contacts|Interactive|Template)} object The message object
     * @param {Request} request The object sent to the server
     * @param {(String|Void)} id The message id, undefined if parsed is set to false
     * @param {(Object|Void)} response The parsed response from the server, undefined if parsed is set to false
     */

    /**
     * Set a callback function for sendMessage
     * 
     * @param {Logger} callback The callback function to set
     * @returns {WhatsAppAPI} The API object, for chaining
     * @throws {Error} If callback is truthy and is not a function
     */
    logSentMessages(callback) {
        if (callback && typeof callback !== "function") throw new TypeError("Callback must be a function");
        this._register = callback;
        return this;
    }

    /**
     * Send a Whatsapp message
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} to The user's phone number
     * @param {(Text|Audio|Document|Image|Sticker|Video|Location|Contacts|Interactive|Template)} object A Whatsapp component, built using the corresponding module for each type of message.
     * @param {String} [context] The message ID of the message to reply to
     * @returns {Promise} The server response
     * @throws {Error} If phoneID is not specified
     * @throws {Error} If to is not specified
     * @throws {Error} If object is not specified
     */
    async sendMessage(phoneID, to, object, context = "") {
        if (!phoneID) throw new Error("Phone ID must be specified");
        if (!to) throw new Error("To must be specified");
        if (!object) throw new Error("Message must have a message object");

        const response = await api.sendMessage(this.token, this.v, phoneID, to, object, context);
        return response;
    }

    async getMedia(mediaID){
        if (!mediaID) throw new Error("Media ID must be specified");
        const promise = await api.getDocumentLink(this.token,this.v,mediaID);
        const documentLink = await promise.json();
        const secondPromise = await api.getImage(this.token,documentLink.url);
        return await secondPromise.buffer();
    }

    /**
     * Mark a message as read
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} messageId The message ID
     * @returns {Promise} The server response
     * @throws {Error} If phoneID is not specified
     * @throws {Error} If messageId is not specified
     */
    markAsRead(phoneID, messageId) {
        if (!phoneID) throw new Error("Phone ID must be specified");
        if (!messageId) throw new Error("To must be specified");
        const promise = api.readMessage(this.token, this.v, phoneID, messageId);
        return this.parsed ? promise.then(e => e.json()) : promise;
    }
    
    /**
     * Generate a QR code for sharing the bot
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} message The quick message on the QR code
     * @param {String} format The format of the QR code (png or svn)
     * @returns {Promise} The server response
     * @throws {Error} If phoneID is not specified
     * @throws {Error} If message is not specified
     * @throws {Error} If format is not either 'png' or 'svn'
     */
    createQR(phoneID, message, format = "png") {
        if (!phoneID) throw new Error("Phone ID must be specified");
        if (!message) throw new Error("Message must be specified");
        if (!["png", "svg"].includes(format)) throw new Error("Format must be either 'png' or 'svg'");
        const promise = api.makeQR(this.token, this.v, phoneID, message, format);
        return this.parsed ? promise.then(e => e.json()) : promise;
    }

    /**
     * Get one or many QR codes of the bot
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} [id] The QR's id to find. If not specified, all QRs will be returned
     * @returns {Promise} The server response
     * @throws {Error} If phoneID is not specified
     */
    retrieveQR(phoneID, id) {
        if (!phoneID) throw new Error("Phone ID must be specified");
        const promise = api.getQR(this.token, this.v, phoneID, id);
        return this.parsed ? promise.then(e => e.json()) : promise;
    }

    /**
     * Update a QR code of the bot
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} id The QR's id to edit
     * @param {String} message The new quick message for the QR code
     * @returns {Promise} The server response
     * @throws {Error} If phoneID is not specified
     * @throws {Error} If id is not specified
     * @throws {Error} If message is not specified
     */
    updateQR(phoneID, id, message) {
        if (!phoneID) throw new Error("Phone ID must be specified");
        if (!id) throw new Error("ID must be specified");
        if (!message) throw new Error("Message must be specified");
        const promise = api.updateQR(this.token, this.v, phoneID, id, message);
        return this.parsed ? promise.then(e => e.json()) : promise;
    }

    /**
     * Delete a QR code of the bot
     * 
     * @param {String} phoneID The bot's phone ID
     * @param {String} id The QR's id to delete
     * @returns {Promise} The server response
     * @throws {Error} If phoneID is not specified
     * @throws {Error} If id is not specified
     */
    deleteQR(phoneID, id) {
        if (!phoneID) throw new Error("Phone ID must be specified");
        if (!id) throw new Error("ID must be specified");
        const promise = api.deleteQR(this.token, this.v, phoneID, id);
        return this.parsed ? promise.then(e => e.json()) : promise;
    }
}

/**
 * @namespace Exports
 * @property {WhatsAppAPI}      WhatsAppAPI                         The main API object
 * @property {Object}           Handlers                            The handlers object
 * @property {Function}         Handlers.post                       The post handler
 * @property {Function}         Handlers.get                        The get handler
 * @property {Object}           Types                               The API types objects
 * @property {Object}           Types.Contacts                      The Contacts module
 * @property {Contacts}         Types.Contacts.Contacts             The API Contacts type object
 * @property {Address}          Types.Contacts.Address              The API Address type object
 * @property {Birthday}         Types.Contacts.Birthday             The API Birthday type object
 * @property {Email}            Types.Contacts.Email                The API Email type object
 * @property {Name}             Types.Contacts.Name                 The API Name type object
 * @property {Organization}     Types.Contacts.Organization         The API Organization type object
 * @property {Phone}            Types.Contacts.Phone                The API Phone type object
 * @property {Url}              Types.Contacts.Url                  The API Url type object
 * @property {Object}           Types.Interactive                   The Interactive module
 * @property {Interactive}      Types.Interactive.Interactive       The API Interactive type object
 * @property {Body}             Types.Interactive.Body              The API Body type object
 * @property {Footer}           Types.Interactive.Footer            The API Footer type object
 * @property {Header}           Types.Interactive.Header            The API Header type object
 * @property {ActionButtons}    Types.Interactive.ActionButtons     The API Action type object
 * @property {Button}           Types.Interactive.Button            The API Button type object
 * @property {ActionList}       Types.Interactive.ActionList        The API Action type object
 * @property {ListSection}      Types.Interactive.ListSection       The API Section type object
 * @property {Row}              Types.Interactive.Row               The API Row type object
 * @property {ActionCatalog}    Types.Interactive.ActionCatalog     The API Action type object
 * @property {ProductSection}   Types.Interactive.ProductSection    The API Section type object
 * @property {Product}          Types.Interactive.Product           The API Product type object
 * @property {Location}         Types.Location                      The API Location type object
 * @property {Object}           Types.Media                         The Media module
 * @property {Media}            Types.Media.Media                   Placeholder, don't use
 * @property {Audio}            Types.Media.Audio                   The API Audio type object
 * @property {Document}         Types.Media.Document                The API Document type object
 * @property {Image}            Types.Media.Image                   The API Image type object
 * @property {Sticker}          Types.Media.Sticker                 The API Sticker type object
 * @property {Video}            Types.Media.Video                   The API Video type object
 * @property {Object}           Types.Template                      The Template module
 * @property {Template}         Types.Template.Template             The API Template type object
 * @property {Language}         Types.Template.Language             The API Language type object
 * @property {ButtonComponent}  Types.Template.ButtonComponent      The API ButtonComponent type object
 * @property {ButtonParameter}  Types.Template.ButtonParameter      The API ButtonParameter type object
 * @property {HeaderComponent}  Types.Template.HeaderComponent      The API HeaderComponent type object
 * @property {BodyComponent}    Types.Template.BodyComponent        The API BodyComponent type object
 * @property {Parameter}        Types.Template.Parameter            The API Parameter type object
 * @property {Currency}         Types.Template.Currency             The API Currency type object
 * @property {DateTime}         Types.Template.DateTime             The API DateTime type object
 * @property {Text}             Types.Text                          The API Text type object
 */
module.exports = {
    WhatsAppAPI,
    Handlers: require('./requests'),
    Types: {
        Contacts: require('./types/contacts'),
        Interactive: require('./types/interactive'),
        Location: require('./types/location'),
        Media: require('./types/media'),
        Template: require('./types/template'),
        Text: require('./types/text'),
    }
};
