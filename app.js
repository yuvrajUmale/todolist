const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const lodash = require('lodash');

 
const app = express();
const _ = require('lodash');
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect('mongodb+srv://admin-yuvraj:Test123@cluster0.ouvgd.mongodb.net/ToDoListDB', {useNewUrlParser:true, useUnifiedTopology:true});
 
//schema of todolist
const ItemsSchema = new mongoose.Schema({
  Name:{
    type:String,
    required:[true, "no name is specified"]
  }
})
 
//model of todolist
const Item = mongoose.model("item", ItemsSchema);
 
//create new default items 
const item1 = new Item({
  Name:"Welcome to your todolist!",
}); 
// item1.save();
 
const item2 = new Item({
  Name:"Hit the + button to add new item ",
}); 
// item2.save();
 
const item3 = new Item({
  Name:"<-- Hit this to delete an item",
}); 
 
const defaultItems = [item1, item2, item3];
 
//new schema for custom name
const ListName = new mongoose.Schema({
  Name : {
    type : String,
    required: [true, "name is not specified"]                          //list array
  },
  items : [ItemsSchema]
});
 
//model for custom name 
const List = mongoose.model("List", ListName);

//home route
app.get("/", function(req, res) {
 
  Item.find({}, (err, foundItems) =>{
    if(foundItems.length === 0){
       Item.insertMany(defaultItems, (err) =>{
        if (err){
        console.log(err);
        }else{
          console.log("item added")
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});
 
// post route for home 
app.post("/", function(req, res){
  const itemName = req.body.newItem; 
  const listName = req.body.list;
//create new items for post route 
  const item = new Item({
    Name : itemName
  });
 
  if( listName=== "Today"){
    item.save();
     res.redirect("/");
  }else{
    List.findOne({Name: listName}, (err, foundList) =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});
 
//post route for delete 
app.post("/delete", (req, res) =>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){                      //delete existing list items
        if(!err){
          console.log("successfully deleted checked items");
          res.redirect("/");
        }
      });
  }else{
    List.findOneAndUpdate({Name: listName}, {$pull: {items: {_id:checkedItemId}}}, (err, foundList) =>{   //delete items in custome names 
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }
});
 
//route parameters
app.get("/:customName", (req, res) =>{
  const customListName = _.capitalize(req.params.customName);
 
//find only single name in the url  
  List.findOne({Name: customListName}, (err, foundList) => {
    if(!err){
      if(!foundList){
        //create new list
        // console.log("doesn't exist");
            const list = List({
              Name : customListName,
              items : defaultItems
            });
            list.save();  
            res.redirect("/"+customListName);
      }else{
        //show an existing list 
        // console.log("exists")
        res.render("list", {listTitle: foundList.Name, newListItems: foundList.items} )
      }
    }
  });
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});