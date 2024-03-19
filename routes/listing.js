const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn}= require("../middleware.js");

// function to validate middleware
const validateSchema=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if (error){
      let errmsg= error.details.map((el)=> el.message).join(",");
      throw new ExpressError(404,errmsg);
    }else{
      next();
    }
  };

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
  // New Route
  router.get("/new", isLoggedIn,(req, res) => {
    res.render("listings/new.ejs");
  });
  
  // //Show Route
  router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flash("error", "Your listing does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  }));
  
  // //Create Route
  router.post("/",validateSchema, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
  }));
  
  //Edit Route
  router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "Your listing does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }));
  
  // //Update Route
  router.put("/:id",validateSchema, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }));
  
  
  // //Delete Route
  router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }));

  module.exports=router;