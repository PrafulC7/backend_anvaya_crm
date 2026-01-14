const express = require("express")
const cors = require("cors");
const app = express()
app.use(cors());
app.use(express.json())
const {initializeDatabase} = require("./db/db.connect")
const Comment = require("./models/comment.models")
const Lead = require("./models/lead.models")
const SalesAgent = require("./models/salesAgent.models")
const Tag = require("./models/tag.models")
initializeDatabase();

app.get("/", async (req,res)=>{
  try{
res.send("Anvaya backend")
  }catch(err){
res.status(404).json({error:"page not found"})
  }
})

//LEADS

app.get("/leads", async (req, res) => {
  try {
    const leads = await Lead.find().populate("salesAgent", "name");;
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/leads/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    res.json(lead);
  } catch (error) {
    res.status(404).json({ message: "Lead not found" });
  }
});

app.post("/leads", async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/leads/:id", async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("salesAgent", "name");
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(updatedLead); // IMPORTANT
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/leads/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// SalesAgent

app.get("/agents", async (req, res) => {
  try {
    const agents = await SalesAgent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/agents/:id", async (req, res) => {
  try {
    const agent = await SalesAgent.findById(req.params.id);
    res.json(agent);
  } catch (error) {
    res.status(404).json({ message: "Agent not found" });
  }
});

app.post("/agents", async (req, res) => {
   try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const agent = new SalesAgent({ name, email });
    await agent.save();

    res.status(201).json(agent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});

app.put("/agents/:id", async (req, res) => {
  try {
    const updatedAgent = await SalesAgent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedAgent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/agents/:id", async (req, res) => {
  try {
    await SalesAgent.findByIdAndDelete(req.params.id);
    res.json({ message: "Sales agent deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/agents/:id/leads", async (req, res) => {
  try {
    const leads = await Lead.find({ agentId: req.params.id });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch("/agents/:id/disable", async (req, res) => {
  try {
    const agent = await SalesAgent.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Comment
app.get("/leads/:leadId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({lead: req.params.leadId}).populate("author", "name").sort({ createdAt: -1 });
res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/leads/:leadId/comments", async (req, res) => {
  try {
    const comment = new Comment({
      lead: req.params.leadId,
      author: req.body.author,
      commentText: req.body.commentText
    });

    const savedComment = await comment.save();
    const populatedComment = await savedComment.populate(
      "author",
      "name"
    );
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/comments/:id", async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { commentText: req.body.commentText },
      { new: true }
    );

    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/comments/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Tag
app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/tags/:id", async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    res.json(tag);
  } catch (error) {
    res.status(404).json({ message: "Tag not found" });
  }
});

app.post("/tags", async (req, res) => {
  try {
    const tag = new Tag({
      name: req.body.name,
      color: req.body.color
    });

    const savedTag = await tag.save();
    res.status(201).json(savedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/tags/:id", async (req, res) => {
  try {
    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// app.get("/api/tags/:id/leads", async (req, res) => {
//   try {
//     const leads = await Lead.find({ tags: req.params.id });
//     res.json(leads);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post("/api/tags/bulk", async (req, res) => {
//   try {
//     const tags = await Tag.insertMany(req.body);
//     res.status(201).json(tags);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });


app.delete("/tags/:id", async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);

    // Optional: remove tag from all leads
    await Lead.updateMany(
      { tags: req.params.id },
      { $pull: { tags: req.params.id } }
    );

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ------------------------------------
// GET /report/last-week
// ------------------------------------
app.get("/last-week", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const leads = await Lead.find({
      status: "Closed",
      closedAt: { $gte: sevenDaysAgo }
    })
      .populate("salesAgent", "name")
      .select("name salesAgent closedAt");

    const response = leads.map(lead => ({
      id: lead._id,
      name: lead.name,
      salesAgent: lead.salesAgent?.name || null,
      closedAt: lead.closedAt
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch last week closed leads" });
  }
});


// ------------------------------------
// GET /report/pipeline
// ------------------------------------
app.get("/pipeline", async (req, res) => {
  try {
    const totalLeadsInPipeline = await Lead.countDocuments({
      status: { $ne: "Closed" }
    });

    res.status(200).json({ totalLeadsInPipeline });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pipeline data" });
  }
});

// const PORT = 3000
// app.listen(PORT, ()=> {
//   console.log(`Server running on port ${PORT}`)
// })
export default app;