const { StaticPage, Admin } = require('../models');
const { logger } = require('../utils/logger');

class StaticPageController {
  /**
   * جلب صفحة ثابتة حسب الـ slug واللغة
   */
  async getPage(req, res) {
    try {
      const { slug } = req.params;
      const { lang = 'ar' } = req.query;

      // التحقق من صحة اللغة
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          success: false,
          message: 'اللغة غير مدعومة. يجب أن تكون ar أو en',
          data: null
        });
      }

      // البحث عن الصفحة
      const page = await StaticPage.findOne({
        where: { slug },
        include: [{
          model: Admin,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }]
      });

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'الصفحة غير موجودة',
          data: null
        });
      }

      // إرجاع المحتوى حسب اللغة
      const response = {
        id: page.id,
        slug: page.slug,
        title: page[`title_${lang}`],
        content: page[`content_${lang}`],
        last_updated: page.updated_at,
        updated_by: page.Updater ? {
          id: page.Updater.id,
          name: page.Updater.name,
          email: page.Updater.email
        } : null
      };

      res.json({
        success: true,
        message: 'تم جلب الصفحة بنجاح',
        data: response
      });

    } catch (error) {
      logger.error('خطأ في جلب الصفحة الثابتة:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم',
        data: null
      });
    }
  }

  /**
   * جلب جميع الصفحات الثابتة (للمسؤولين)
   */
  async getAllPages(req, res) {
    try {
      const pages = await StaticPage.findAll({
        include: [{
          model: Admin,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }],
        order: [['updated_at', 'DESC']]
      });

      const formattedPages = pages.map(page => ({
        id: page.id,
        slug: page.slug,
        title_ar: page.title_ar,
        title_en: page.title_en,
        content_ar: page.content_ar,
        content_en: page.content_en,
        updated_at: page.updated_at,
        updated_by: page.Updater ? {
          id: page.Updater.id,
          name: page.Updater.name,
          email: page.Updater.email
        } : null
      }));

      res.json({
        success: true,
        message: 'تم جلب جميع الصفحات بنجاح',
        data: formattedPages
      });

    } catch (error) {
      logger.error('خطأ في جلب جميع الصفحات:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم',
        data: null
      });
    }
  }

  /**
   * تحديث صفحة ثابتة (للمسؤولين فقط)
   */
  async updatePage(req, res) {
    try {
      const { id } = req.params;
      const { title_ar, title_en, content_ar, content_en } = req.body;
      const adminId = req.user.id; // من middleware المصادقة

      // التحقق من وجود البيانات المطلوبة
      if (!title_ar || !title_en || !content_ar || !content_en) {
        return res.status(400).json({
          success: false,
          message: 'جميع الحقول مطلوبة',
          data: null
        });
      }

      // البحث عن الصفحة
      const page = await StaticPage.findByPk(id);
      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'الصفحة غير موجودة',
          data: null
        });
      }

      // تحديث الصفحة
      await page.update({
        title_ar,
        title_en,
        content_ar,
        content_en,
        updated_by: adminId
      });

      // جلب الصفحة المحدثة مع معلومات المسؤول
      const updatedPage = await StaticPage.findByPk(id, {
        include: [{
          model: Admin,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }]
      });

      const response = {
        id: updatedPage.id,
        slug: updatedPage.slug,
        title_ar: updatedPage.title_ar,
        title_en: updatedPage.title_en,
        content_ar: updatedPage.content_ar,
        content_en: updatedPage.content_en,
        updated_at: updatedPage.updated_at,
        updated_by: updatedPage.Updater ? {
          id: updatedPage.Updater.id,
          name: updatedPage.Updater.name,
          email: updatedPage.Updater.email
        } : null
      };

      res.json({
        success: true,
        message: 'تم تحديث الصفحة بنجاح',
        data: response
      });

    } catch (error) {
      logger.error('خطأ في تحديث الصفحة:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم',
        data: null
      });
    }
  }

  /**
   * جلب صفحة حسب الـ slug (للمسؤولين)
   */
  async getPageBySlug(req, res) {
    try {
      const { slug } = req.params;

      const page = await StaticPage.findOne({
        where: { slug },
        include: [{
          model: Admin,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }]
      });

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'الصفحة غير موجودة',
          data: null
        });
      }

      const response = {
        id: page.id,
        slug: page.slug,
        title_ar: page.title_ar,
        title_en: page.title_en,
        content_ar: page.content_ar,
        content_en: page.content_en,
        updated_at: page.updated_at,
        updated_by: page.Updater ? {
          id: page.Updater.id,
          name: page.Updater.name,
          email: page.Updater.email
        } : null
      };

      res.json({
        success: true,
        message: 'تم جلب الصفحة بنجاح',
        data: response
      });

    } catch (error) {
      logger.error('خطأ في جلب الصفحة:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم',
        data: null
      });
    }
  }
}

module.exports = new StaticPageController();
