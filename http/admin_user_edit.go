package http

import (
	"github.com/ArtalkJS/ArtalkGo/model"
	"github.com/labstack/echo/v4"
)

type ParamsAdminUserEdit struct {
	// 查询值
	ID uint `mapstructure:"id" param:"required"`

	// 修改值
	Name         string `mapstructure:"name"`
	Email        string `mapstructure:"email"`
	Password     string `mapstructure:"password"`
	Link         string `mapstructure:"link"`
	IsAdmin      bool   `mapstructure:"is_admin"`
	SiteNames    string `mapstructure:"site_names"`
	ReceiveEmail bool   `mapstructure:"receive_email"`
}

func (a *action) AdminUserEdit(c echo.Context) error {
	if !GetIsSuperAdmin(c) {
		return RespError(c, "无权操作")
	}

	var p ParamsAdminUserEdit
	if isOK, resp := ParamsDecode(c, &p); !isOK {
		return resp
	}

	user := model.FindUserByID(p.ID)
	if user.IsEmpty() {
		return RespError(c, "user 不存在")
	}

	// 改名名合法性检测
	modifyName := p.Name != user.Name
	modifyEmail := p.Email != user.Email

	if modifyName && modifyEmail && !model.FindUser(p.Name, p.Email).IsEmpty() {
		return RespError(c, "user 已存在，请更换用户名和邮箱")
	}

	// 删除原有缓存
	model.UserCacheDel(&user)

	// 修改 user
	user.Name = p.Name
	user.Email = p.Email
	if p.Password != "" {
		user.SetPasswordEncrypt(p.Password)
	}
	user.Link = p.Link
	user.IsAdmin = p.IsAdmin
	user.SiteNames = p.SiteNames
	user.ReceiveEmail = p.ReceiveEmail

	err := model.UpdateUser(&user)
	if err != nil {
		return RespError(c, "user 保存失败")
	}

	return RespData(c, Map{
		"user": user.ToCookedForAdmin(),
	})
}
