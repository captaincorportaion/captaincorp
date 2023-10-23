const Validator = require("validatorjs");
const db = require('../config/db.config');
const { Op } = require('sequelize')
const { UploadFiles } = require('../helpers/file')


//...................models............
const Users = db.users;
const Item_categories = db.items_categories;
const Items = db.items;
const Items_photos = db.item_photos;
const Rent_item_booking = db.rent_item_booking;
const Sale_item_booking = db.sale_item_booking;


//..............add item for sale & rent.................
const addItem = async (req, res) => {
    let validation = new Validator(req.body, {
        item_type: 'required|in:Rent,Sale',
        title: 'required|string',
        description: 'required|string',
        price: 'required|numeric',
        city: 'required|string',
        price_duration: 'required_if:item_type,Rent|in:per day',
        security_deposite: 'required_if:item_type,Rent',
        lat: 'required',
        address: 'required',
        long: 'required',
        item_category_id: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { item_type, title, description, price, address, city, price_duration, security_deposite, lat, long, item_category_id } = req.body;

        const authUser = req.user.id;

        const itemData = await Items.create({ user_id: authUser, item_type, title, address, description, price, city, price_duration, security_deposite, lat, long, item_category_id });

        //..................upload photo....
        if (itemData) {

            let photos = [];
            if (typeof req.files !== 'undefined' && req.files.length > 0) {
                photos = await UploadFiles(req.files, 'images/item_images', 'mediaImg');
            }
            for (const image of photos) {
                await Items_photos.create({
                    items_id: itemData.id,
                    photo: image
                })
            }
        }

        const findItem = await Items.findOne({
            where: { id: itemData.id },
            include: [
                {
                    model: Items_photos,
                    attributes: ['photo', 'id']
                },
                {
                    model: Item_categories,
                    attributes: ['name', 'id']
                },
            ],
        });

        return RESPONSE.success(res, 2101);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//..............add item for sale & rent.................
const updateItem = async (req, res) => {
    try {
        const authUser = req.user.id;
        const itemId = req.params.id;
        const { title, description, price, city, price_duration, security_deposite, lat, long, item_category_id, address } = req.body;

        // console.log('eventId', eventId)

        const item = await Items.findOne({ where: { id: itemId, user_id: authUser } });
        if (!item) {
            return RESPONSE.error(res, 'item not found');
        }

        const itemData = await item.update(
            { title, description, price, city, price_duration, security_deposite, lat, long, item_category_id, address },

        );

        //..................upload photo....
        if (itemData) {

            let photos = [];
            if (typeof req.files !== 'undefined' && req.files.length > 0) {
                photos = await UploadFiles(req.files, 'images/item_images', 'mediaImg');
            }
            for (const image of photos) {
                await Items_photos.create({
                    items_id: itemData.id,
                    photo: image
                })
            }
        }

        const findItem = await Items.findOne({
            where: { id: itemData.id },
            include: [
                {
                    model: Items_photos,
                    attributes: ['photo', 'id']
                },
                {
                    model: Item_categories,
                    attributes: ['name', 'id']
                },
            ],
        });

        return RESPONSE.success(res, 2109);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//item delete
const deleteItem = async (req, res) => {
    try {
        const authUser = req.user.id;
        const id = req.params.id;
        const item = await Items.findOne({ where: { id: id, user_id: authUser } });
        if (!item) {
            return RESPONSE.error(res, 'item not found');
        }

        const media = await item.destroy({ where: { id: id } });

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}


//delete media by id

const deleteItemPhotos = async (req, res) => {
    try {
        const ids = req.body.id;
        // console.log('ids', ids)
        const authUser = req.user.id;
        const deletedMedia = [];

        const itemsIds = await Items_photos.findAll({
            where: { id: ids },
            attributes: ['items_id'],
        });
        // console.log('itemsIds', itemsIds)

        for (const item of itemsIds) {
            const items_id = item.items_id;


            const associatedItem = await Items.findOne({
                where: { id: items_id, user_id: authUser },
            });
            // console.log('associatedItem', associatedItem)

            if (associatedItem) {

                await Items_photos.destroy({ where: { id: ids } });
                deletedMedia.push(item.id);
            } else {
                return RESPONSE.error(res, "You are not allowed to delete this photo");
            }
        }

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}


//.......................get All Items_categories.......
const getAllItemsCategories = async (req, res) => {
    try {
        const authUser = req.user;

        const itemCategories = await Item_categories.findAll();

        if (!itemCategories) {
            return RESPONSE.error(res, 2103);
        }

        return RESPONSE.success(res, 2102, itemCategories);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//...................get All Rent & sale .................

const getAllRentAndSale = async (req, res) => {
    let validation = new Validator(req.query, {
        item_type: 'required|in:Rent,Sale',
        min_budget: 'numeric|min:0',
        max_budget: 'numeric|min:0'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { item_type, item_category_id, city, min_budget, max_budget } = req.query;

        let condition = {
            item_type: item_type
        }

        if (item_category_id) {
            condition.item_category_id = item_category_id
        }

        if (city) {
            condition.city = city
        }

        if (min_budget && max_budget) {
            condition.price = { [Op.gte]: min_budget, [Op.lte]: max_budget }
        }

        const findAllData = await Items.findAll({
            where: condition,
            include: [
                {
                    model: Items_photos,
                    attributes: ['photo', 'id']
                },
                {
                    model: Item_categories,
                    attributes: ['name', 'id']
                },
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!findAllData.length) {
            return RESPONSE.error(res, 2105);
        }

        return RESPONSE.success(res, 2104, findAllData);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//...........................get Rent and Sale by id...............

const getRentAndSaleById = async (req, res) => {
    let validation = new Validator(req.query, {
        item_type: 'required|in:Rent,Sale',
        id: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    try {
        const { item_type, id } = req.query;

        const findData = await Items.findOne(
            {
                where: { id: id, item_type: item_type },
                include: [
                    {
                        model: Items_photos,
                        attributes: ['photo', 'id']
                    },
                    {
                        model: Item_categories,
                        attributes: ['name', 'id']
                    },
                    {
                        model: Users,
                        attributes: ['name', 'picture']
                    }
                ],
            })

        if (!findData) {
            return RESPONSE.error(res, 2105);
        }

        return RESPONSE.success(res, 2104, findData);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//...........................get your Rent and Sale...............

const getRentAndSale = async (req, res) => {
    let validation = new Validator(req.query, {
        item_type: 'required|in:Rent,Sale'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    try {
        const { user: { id } } = req;
        const { item_type } = req.query;

        const findData = await Items.findAll(
            {
                where: { item_type: item_type, user_id: id },
                include: [
                    {
                        model: Items_photos,
                        attributes: ['photo', 'id']
                    },
                    {
                        model: Item_categories,
                        attributes: ['name', 'id']
                    },
                ],
            })
        if (!findData.length) {
            return RESPONSE.error(res, 2105);
        }
        return RESPONSE.success(res, 2104, findData);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//......................rent item  booking............................

const bookingRentItem = async (req, res) => {
    let validation = new Validator(req.body, {
        item_id: 'required',
        rent_time: 'required|numeric|min:1'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { item_id, rent_time } = req.body;

        const authUser = req.user;

        const isExist = await Rent_item_booking.findAll({
            where: {
                user_id: authUser.id,
                item_id: item_id,
                status: {
                    [Op.or]: ['Pending', 'Accept']
                }
            }
        });


        if (isExist.length) {
            return RESPONSE.error(res, 2107)
        }

        const findItem = await Items.findOne({ where: { id: item_id, item_type: 'Rent' } });

        if (!findItem) {
            return RESPONSE.error(res, 1105)
        }

        var total = findItem.price + findItem.security_deposite;
        total = total * rent_time;

        const bookingItem = await Rent_item_booking.create({ item_id, user_id: authUser.id, rent_time, total_price: total });

        return RESPONSE.success(res, 2106, bookingItem);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//.......................... sale item booking ................
const bookingSaleItem = async (req, res) => {
    let validation = new Validator(req.query, {
        item_id: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { item_id } = req.query;

        const authUser = req.user;

        const isExist = await Sale_item_booking.findAll({
            where: {
                user_id: authUser.id,
                item_id: item_id,
                status: {
                    [Op.or]: ['Pending', 'Accept']
                }
            }
        });

        if (isExist.length) {
            return RESPONSE.error(res, 2107)
        }

        const findItem = await Items.findOne({ where: { id: item_id, item_type: 'Sale' } });

        if (!findItem) {
            return RESPONSE.error(res, 1105)
        }

        const bookingItem = await Sale_item_booking.create({ item_id, user_id: authUser.id });

        return RESPONSE.success(res, 2108, bookingItem);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}



module.exports = {
    getAllItemsCategories,
    addItem,
    getAllRentAndSale,
    getRentAndSaleById,
    bookingRentItem,
    getRentAndSale,
    bookingSaleItem,
    updateItem,
    deleteItemPhotos,
    deleteItem
}


