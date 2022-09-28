const { Contacts } = require('./types/contacts');
const { Interactive } = require("./types/interactive");
const { Audio, Document, Image, Sticker, Video } = require('./types/media');
const Location = require('./types/location');
const { Template } = require('./types/template');
const Text = require('./types/text');

const req = require('./fetch-picker').pick();

/**
 * Request API object
 * 
 * @property {String} messaging_product The messaging product (always "whatsapp")
 * @property {String} type The type of message
 * @property {String} to The user's phone number
 * @property {Object} [context] The message to reply to
 * @property {String} context.message_id The message id to reply to
 * @property {String} [text] The text object stringified to send
 * @property {String} [audio] The audio object stringified to send
 * @property {String} [document] The document object stringified to send
 * @property {String} [image] The image object stringified to send
 * @property {String} [sticker] The sticker object stringified to send
 * @property {String} [video] The video object stringified to send
 * @property {String} [location] The location object stringified to send
 * @property {String} [contacts] The contacts object stringified to send
 * @property {String} [interactive] The interactive object stringified to send
 * @property {String} [template] The template object stringified to send
 */
class Request {
    /**
     * Create a Request object for the API
     * 
     * @param {(Text|Audio|Document|Image|Sticker|Video|Location|Contacts|Interactive|Template)} object The object to send
     * @param {String} to The user's phone number
     * @param {String} context The message_id to reply to
     */
    constructor(object, to, context) {
        let message = { ...object };
        this.messaging_product = "whatsapp";
        this.type = message._;
        delete message._;
        this.to = to;

        if (context) this.context = { message_id: context };

        // If the object contains its name as a property, it means it's an array, use it, else use the class
        // This horrible thing comes from Contacts, the only API element which must be an array instead of an object...
        this[this.type] = JSON.stringify(message[this.type] ? message:undefined);
    }
}

/**
 * The sendMessage response object
 * 
 * @package
 * @ignore
 * @typedef {Object} SendMessageResponse
 * @property {Promise} promise The fetch promise
 * @property {Request} request The request sent to the server
 */

/**
 * Make a message post request to the API
 * 
 * @package
 * @ignore
 * @param {String} token The API token
 * @param {String} v The API version
 * @param {String} phoneID The bot's phone id
 * @param {String} to The user's phone number
 * @param {(Text|Audio|Document|Image|Sticker|Video|Location|Contacts|Interactive|Template)} object Each type of message requires a specific type of object, for example, the "image" type requires an url and optionally captions. Use the constructors for each specific type of message (contacts, interactive, location, media, template, text)
 * @param {String} context The message id to reply to
 * @returns {SendMessageResponse} An object with the sent request and the fetch promise
 */
async function sendMessage(token, v, phoneID, to, object, context) {
    const request = new Request(object, to, context);

    // Make the post request
    return await req(`https://graph.facebook.com/${v}/${phoneID}/messages`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

}

async function getDocumentLink(token,v,mediaID){
    return await req(`https://graph.facebook.com/${v}/${mediaID}`, {
           method: "GET",
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
           }
       });
   
   
   }
   
   async function getImage(token,link){
       return await req(link, {
           method: "GET",
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
               'Accept': '*/*'
           }
       });
   }

/**
 * Mark a message as read
 * 
 * @package
 * @ignore
 * @param {String} token The API token
 * @param {String} v The API version
 * @param {String} phoneID The bot's phone id
 * @param {String} message_id The message id
 * @returns {Promise} The fetch promise
 */
function readMessage(token, v, phoneID, message_id) {
    return req(`https://graph.facebook.com/${v}/${phoneID}/messages`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            status: "read",
            message_id,
        }),
    });
}

/**
 * Generate a QR code for the bot
 * 
 * @package
 * @ignore
 * @param {String} token The API token
 * @param {String} v The API version
 * @param {String} phoneID The bot's phone id
 * @param {String} message The default message in the QR code
 * @param {String} format The image format of the QR code (png or svg)
 * @returns {Promise} The fetch promise
 */
function makeQR(token, v, phoneID, message, format) {
    const params = {
        generate_qr_image: format,
        prefilled_message: message,
    };

    return req(`https://graph.facebook.com/${v}/${phoneID}/message_qrdls?${new URLSearchParams(params)}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

/**
 * Get one or all the QR codes for the bot
 * 
 * @package
 * @ignore
 * @param {String} token The API token
 * @param {String} v The API version
 * @param {String} phoneID The bot's phone id
 * @param {String} [id] The QR's id to get. If not specified, all the QR codes will be returned
 * @returns {Promise} The fetch promise
 */
function getQR(token, v, phoneID, id) {
    return req(`https://graph.facebook.com/${v}/${phoneID}/message_qrdls/${id ? id:""}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

/**
 * Update a QR code for the bot
 * 
 * @package
 * @ignore
 * @param {String} token The API token
 * @param {String} v The API version
 * @param {String} phoneID The bot's phone id
 * @param {String} id The QR's id to edit
 * @param {String} message The new message for the QR code
 * @returns {Promise} The fetch promise
 */
function updateQR(token, v, phoneID, id, message) {
    const params = {
        prefilled_message: message,
    };

    return req(`https://graph.facebook.com/${v}/${phoneID}/message_qrdls/${id}?${new URLSearchParams(params)}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

/**
 * Delete a QR code
 * 
 * @package
 * @ignore
 * @param {String} token The API token
 * @param {String} v The API version
 * @param {String} phoneID The bot's phone id
 * @param {String} id The QR's id to delete
 * @returns {Promise} The fetch promise
 */
function deleteQR(token, v, phoneID, id) {
    return req(`https://graph.facebook.com/${v}/${phoneID}/message_qrdls/${id}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

module.exports = { sendMessage, readMessage, makeQR, getQR, getDocumentLink, updateQR, getImage , deleteQR, Request };