
const Wallet = require("../../models/walletSchema");


const getWallet = async (req,res) => {
    try {

        if(!req.session.user || !req.session.user._id){
            return res.redirect("/login");
        }
        const userId = req.session.user._id;
        const walletData = await Wallet.findOne({userId}).populate("transactions.orderId");

        if(!walletData){
            return res.render("wallet",{walletData:{balance:0,transactions:[]}});
        }

        
        walletData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));


        res.render("wallet",{walletData});
    } catch (error) {
        console.error("Error loading wallet page",error);
        res.redirect("/pageNotFound");
    }
}

module.exports = {
    getWallet,

}