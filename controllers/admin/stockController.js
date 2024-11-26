
const Product = require('../../models/ProductSchema');

const getStocks = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page-1)*limit;
        const count = await Product.countDocuments();
        const totalPages = Math.ceil(count/limit);



        const products = await Product.find()
        .populate('category', 'name').skip(skip).limit(limit);


        res.render('stocks',{
            products,
            totalPages,
            currentPage:page,
        });


    } catch (error) {
        
    }
}

const updateStock = async (req,res) => {
    try {
        
        const {productId,newStock} = req.body;
        await Product.findByIdAndUpdate(productId,{quantity:newStock});
        res.json({ success: true });

    } catch (error) {
        console.error("Error updating stock",error);
        res.json({ success: false });
    }
}

module.exports = {
    getStocks,
    updateStock
}
