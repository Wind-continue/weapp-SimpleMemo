Page({
  data: {
    memo: null // 存储当前备忘录详情
  },

  onLoad(options) {
    // 获取从列表页传递过来的备忘录ID
    const memoId = options.id;
    if (memoId) {
      this.loadMemoDetail(memoId);
    } else {
      // 如果没有ID，返回列表页
      wx.navigateBack();
    }
  },

  // 加载备忘录详情
  loadMemoDetail(id) {
    // 从本地存储中获取所有备忘录
    const memos = wx.getStorageSync("memos") || [];
    // 查找当前ID对应的备忘录
    const memo = memos.find(item => item.id === id);
    
    if (memo) {
      this.setData({ memo });
    } else {
      // 如果找不到对应的备忘录，返回列表页
      wx.showToast({
        title: "备忘录不存在",
        icon: "none"
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }
  },

  // 返回列表页
  goBack() {
    wx.navigateBack();
  }
});
    