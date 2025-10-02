const { StaticPage, User } = require('../models');
const logger = require('../utils/logger');

class StaticPageController {
  /**
   * إنشاء صفحة ثابتة جديدة (للمسؤولين فقط)
   */
  async createPage(req, res) {
    try {
      console.log('Request body:', req.body);
      console.log('User:', req.user);
      
      const { title_ar, title_en, content_ar, content_en, slug } = req.body;
      const adminId = req.user?.id; // Use optional chaining

      // التحقق من وجود البيانات المطلوبة
      if (!title_ar || !title_en || !content_ar || !content_en || !slug) {
        return res.status(400).json({
          success: false,
          message: 'جميع الحقول مطلوبة',
          data: null
        });
      }

      // التحقق من عدم وجود صفحة بنفس الـ slug
      const existingPage = await StaticPage.findOne({ where: { slug } });
      if (existingPage) {
        return res.status(400).json({
          success: false,
          message: 'يوجد صفحة بنفس المعرف بالفعل',
          data: null
        });
      }

      // إنشاء الصفحة
      const page = await StaticPage.create({
        slug,
        title_ar,
        title_en,
        content_ar,
        content_en,
        updated_by: adminId
      });

      // جلب الصفحة مع معلومات المسؤول
      const createdPage = await StaticPage.findByPk(page.id, {
        include: [{
          model: User,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }]
      });

      const response = {
        id: createdPage.id,
        slug: createdPage.slug,
        title_ar: createdPage.title_ar,
        title_en: createdPage.title_en,
        content_ar: createdPage.content_ar,
        content_en: createdPage.content_en,
        updated_at: createdPage.updated_at,
        updated_by: createdPage.Updater ? {
          id: createdPage.Updater.id,
          name: createdPage.Updater.name,
          email: createdPage.Updater.email
        } : null
      };

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الصفحة بنجاح',
        data: response
      });

    } catch (error) {
      console.error('Full error:', error);
      logger.error('Error creating static page: %o', error);

      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(422).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      // Handle unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      // Handle foreign key errors
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid reference',
          errors: [{
            field: error.fields[0],
            message: `Invalid ${error.fields[0]} reference`
          }]
        });
      }

      // Handle other errors
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
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
          model: User,
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
      logger.error('Error fetching static page: %o', error);
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
          model: User,
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
      logger.error('Error fetching all static pages: %o', error);
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
          model: User,
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
      logger.error('Error updating static page: %o', error);
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
          model: User,
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
      logger.error('Error fetching static page by slug: %o', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم',
        data: null
      });
    }
  }

  /**
   * حذف صفحة ثابتة
   */
  async deletePage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // البحث عن الصفحة
      const page = await StaticPage.findByPk(id);

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'الصفحة غير موجودة',
          data: null
        });
      }

      // حذف الصفحة
      await page.destroy();

      logger.info(`Static page ${id} deleted by user ${userId}`);

      res.json({
        success: true,
        message: 'تم حذف الصفحة بنجاح'
      });

    } catch (error) {
      logger.error('Error deleting static page: %o', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم',
        data: null
      });
    }
  }
}

module.exports = new StaticPageController();
