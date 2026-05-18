import Post from '../models/Post.js';
import User from '../models/User.js';

// Get all posts (feed) - newest first
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'fullName avatar email')
      .populate('comments.user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { image, caption, foodName, foodIcon, calories, protein, carbs, fat, mealType } = req.body;
    if (!image || !foodName || calories === undefined) {
      return res.status(400).json({ message: 'Image, food name, and calories are required' });
    }

    const post = await Post.create({
      user: req.user.id,
      image,
      caption: caption || '',
      foodName,
      foodIcon: foodIcon || '🍽️',
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      mealType: mealType || 'Meal',
    });

    const populated = await post.populate('user', 'fullName avatar email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle like on a post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const liked = post.likes.some(id => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes, liked: !liked });
  } catch (err) {
    console.error('Toggle like error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user.id, text: text.trim() });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'fullName avatar email')
      .populate('comments.user', 'fullName avatar');

    res.status(201).json(populated.comments[populated.comments.length - 1]);
  } catch (err) {
    console.error('Add comment error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post (owner or admin)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const currentUser = await User.findById(req.user.id);

    if (post.user.toString() !== req.user.id && (!currentUser || currentUser.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
