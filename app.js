const express = require('express');
const bodyParser = require('body-parser');
const _ = require("lodash");

// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
// let items = ['Buy food', 'Coocking'];    //using databse
// let workitems = [];

app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb+srv://admin-asad:admin@cluster0.v9lja.mongodb.net/todolistDB");



const activitySchema = new mongoose.Schema({
  name: String,
});
const Activity = mongoose.model("Activity", activitySchema);

const activity1 = new Activity({
  name: "Welcome to your to do list"
});

const activity2 = new Activity({
  name: "Click plus button to add new item"
});
const activity3 = new Activity({
  name: "Tick the checkbox if you want to delete"
});
const defaultItem = [activity1, activity2, activity3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [activitySchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  // let currentDay = date.getDate();
  Activity.find(function(err, activities) {
    if (activities.length === 0) {

      Activity.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully added in todolistDB");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        kindofDay: "Today",
        newlistItem: activities
      })
    }
  });
  // res.render("list", {
  //   kindofDay: "Today",
  //   newlistItem: items
  // })
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      console.log(err);
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItem
        })
        list.save()
        res.redirect("/" + customListName)
      } else {
        //show a list
        console.log("Exist");
        res.render("list", {
          kindofDay: customListName,
          newlistItem: foundList.items
        })
      }
    }
  });


});

app.post("/", function(req, res) {
  let item = req.body.newItem;
  const listTitle = req.body.listTitle;
  const activity4 = new Activity({
    name: item
  });
  if (listTitle === "Today") {
    activity4.save()
    res.redirect("/")
  } else {
    List.findOne({
      name: listTitle
    }, function(err, foundList) {
      foundList.items.push(activity4);
      foundList.save()
      res.redirect("/" + listTitle)
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedItemID = (req.body.checkbox);
  const listTitle = req.body.listTitle
  if (listTitle === "Today") {
    Activity.deleteOne({
      _id: checkedItemID
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully deleted");
      }
      res.redirect("/")
    });
  } else {
    List.findOneAndUpdate({
      name: listTitle
    }, {
      $pull: {
        items: {
          _id: checkedItemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listTitle)
      }
    });
  }

});

app.get("/work", function(req, res) {
  res.render("list", {
    kindofDay: "Work",
    newlistItem: workitems
  })
});

app.get("/about", function(req, res) {
  res.render("about")
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("server has started successfully");
});
