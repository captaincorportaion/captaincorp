const MESSAGES = {
    //auth controller
    '1001': 'Signup successfully!',
    '1002': 'Login successfully!',
    '1003': 'email already exists',
    '1004': 'User not found!',
    '1005': 'Incorrect password',
    '1006': "Reset password email has been successfully sent",
    '1007': "Invalid reset token",
    '1008': "Password reset successful",
    '1009': "Invaild token",
    '1010': "Show Notification.",
    '1011': "Notification Status update successfully....",
    '1012': "Request not found",
    '1013': "Select valid type",
    '1014': "ConverSation not found",
    '1015': "Update profile successfully",
    '1016': "get profile successfully",

    //ROOM
    '1101': "Added room successfully",
    '1102': "get all Room types",
    '1103': "data null",
    '1104': "get all rooms",
    '1105': "Data not found!",
    '1106': "Room Booking successfully..",
    '1107': "get all room amenities",
    '1108': "get all room amenities",
    '1109': "Room update successfully",
    '1110': "Deleted successfully",
    '1111': 'You are Already Book Room',

    //saved post
    '1201': "Room unsaved successfully",
    '1202': "get all posts",
    '1203': "post not found!",
    '1204': "Room saved successfully",
    '1205': "Event unsaved successfully",
    '1206': "Event saved successfully",
    '1207': "Roommate unsaved successfully",
    '1208': "Roommate saved successfully",
    '1209': "Item unsaved successfully",
    '1210': "Item saved successfully",


    //event 
    '2001': 'Get event categories successfully.',
    '2002': 'event categories not found.',
    '2003': 'Get event amenities successfully.',
    '2004': 'event amenities not found.',
    '2005': 'Create event successfully..',
    '2006': 'event Booking successfully..',
    '2007': 'Ticket not available',
    '2008': 'get all events',
    '2009': 'Event updated sucessfully.. ',
    '2010': 'Event not found. ',

    //item sale & rent 
    '2101': 'Create item successfully..',
    '2102': 'Get item categories successfully..',
    '2103': 'item categories not found',
    '2104': 'Get Rent & Sale successfully..',
    '2105': 'Sale Or Rent not found',
    '2106': 'Rent item booking successfully..',
    '2107': 'you are already book item.',
    '2108': 'Sale item booking successfully..',
    '2109': 'item update successfully..',

    //roommate
    '2201': 'Add roommate successfully..',
    '2202': 'You can upload only one image',
    '2203': 'Get roommate successfully',
    '2204': 'roommate data not found',
    '2205': 'roommate updated successfully',
    '2206': 'get all lifestyle',
    '2207': 'get all socialmedia',
    '2208': 'get all interest',

    // roommate booking
    '2301': 'Roommate Booking successfully',
    '2302': 'Enter a valid minimum stay',
    '2303': 'You are Already Book roommate',

    //card
    '2401': 'card added',
    '2402': 'get all cards',

}

module.exports.getMessage = function (messageCode) {
    if (isNaN(messageCode)) {
        return messageCode;
    }
    return messageCode ? MESSAGES[messageCode] : '';
};