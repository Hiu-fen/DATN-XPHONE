const News = require('../models/News');

exports.getAllNews = async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPublishedNews = async (req, res) => {
    try {
        // ✅ Chỉ lấy bài viết đã publish (status = true)
        const publishedNews = await News.find({ status: true }).sort({ createdAt: -1 });
        res.json(publishedNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const viewCache = new Map();

exports.getNewsById = async (req, res) => {
  try {
    const newsId = req.params.id;
    const ip = req.ip; // Lấy IP người dùng

    const cacheKey = `${ip}_${newsId}`;
    const now = Date.now();

    // Nếu người này đã xem bài này trong 60 giây
    if (viewCache.has(cacheKey) && now - viewCache.get(cacheKey) < 60 * 1000) {
    //   console.log(`❌ Không tăng view vì ${ip} vừa xem bài ${newsId}`);
    } else {
      // ✅ Tăng views
      const news = await News.findById(newsId);
      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      news.views += 1;
      await news.save();

      // Cập nhật cache: lưu thời gian xem bài
      viewCache.set(cacheKey, now);

      // Xóa cache sau 60 giây để tránh memory leak
      setTimeout(() => viewCache.delete(cacheKey), 60 * 1000);
    }

    // Trả về bài viết
    const news = await News.findById(newsId); // Lấy lại để gửi về client
    res.json(news);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.adminGetNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        // ❌ Không tăng views
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createNews = async (req, res) => {
    const news = new News(req.body);
    try {
        const newNews = await news.save();
        res.status(201).json(newNews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật trạng thái tin tức
exports.updateNewsStatus = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        // ✅ Cập nhật trạng thái (true/false)
        news.status = req.body.status;
        await news.save();

        res.json({
            success: true,
            message: `News status updated to ${news.status ? 'published' : 'draft'}`,
            news
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.updateNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        Object.assign(news, req.body);
        const updatedNews = await news.save();
        res.json(updatedNews);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json({ success: true, message: 'News deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 