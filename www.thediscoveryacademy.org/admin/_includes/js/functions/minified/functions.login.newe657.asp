$.fn.e4eLogin = function () {
    var args = arguments[0] || {};
    var options = $.extend({}, $.e4eLogin.defaults, args);
    options.formSettings = $.extend({}, $.e4eLogin.defaults.formSettings, args.formSettings || {});
    var elem = $(this);
    this.each(function () {
        new $.e4eLogin.construct(elem, options);
    });
};
$.e4eLogin = {
    defaults: {
        overlay: true,
        overlaySettings: { setClass: "login-overlay", color: "#000", opacity: 0.6 },
        minimal: false,
        animate: true,
        redirectURL1: "" + window.location,
        redirectOnSignup: "",
        formSettings: {
            setClass: "login-panel",
            forgottenLink: false,
            forgottenInput: true,
            forgottenInputSettings: {
                preHTML:
                    "<h3>Having trouble logging in?</h3><p>If you would like us to reset your password via email please enter your email address here:</p>",
            },
            inputSettings: { preHTML: "" },
            forgottenButtonHTML: "Having trouble logging in?",
            logo: true,
            logoSrc: "/admin/_includes/images/design/juniper.png",
            websiteName: true,
            loginHTML:
                "<h1 class='login-header'><strong>Juniper Education</strong><br /><br />Secure Login <small>Discovery Academy</small></h1>",
            closeButton: true,
            signup: "False" === "True",
            ssoStatus: "",
            initialMessage: "",
        },
    },
    loginCount: 0,
    construct: function (elem, options) {
        $.e4eLogin.loginCount++;
        if (elem.prop("tagName") === "BODY" && $("#admin_dialog").length < 1) {
            $(elem).prepend($('<dialog id="admin_dialog" class="admin_ui" />'));
            elem = $("#admin_dialog");
            document.getElementById("admin_dialog").showModal();
        }
        var ssoType = "";
        if (ssoType === "Azure AD") {
            ssoType += " (Office 365)";
        }
        var urlparams = new URLSearchParams(window.location.search);
        if (options.formSettings.initialMessage === "") {
            if (urlparams.get("login_message")) {
                options.formSettings.initialMessage = urlparams.get("login_message");
            } else if (urlparams.get("redirect_error") === "no_account") {
                options.formSettings.initialMessage =
                    "No matching account found. Please log in with your CMS credentials.";
            }
        }
        var postLoginURL = window.location.pathname;
        urlparams.delete("login");
        urlparams.delete("login_message");
        urlparams.delete("redirect_error");
        urlparams.delete("retry");
        const urlString = urlparams.toString();
        if (urlString.length > 0) {
            postLoginURL += "?" + urlparams.toString();
        }
        $(elem)
            .append(
                options.overlay === true
                    ? $("<div/>")
                          .addClass("admin_dialog_overlay")
                          .on("touchstart mousedown", function () {
                              $.e4eLogin.doClose($(this));
                          })
                    : ""
            )
            .append(
                $("<div/>")
                    .addClass("admin_dialog_box")
                    .addClass("admin_dialog_box-login")
                    .addClass(options.formSettings.ssoStatus)
                    .append(
                        options.overlay === true && options.formSettings.closeButton === true
                            ? $("<button />")
                                  .addClass("login-close")
                                  .addClass("admin_close")
                                  .on("click", function () {
                                      $.e4eLogin.doClose($(this));
                                  })
                            : ""
                    )
                    .append(
                        options.minimal === false && options.formSettings.logo === true
                            ? $("<div />")
                                  .addClass("login-logo")
                                  .append('<img src="' + options.formSettings.logoSrc + '" />')
                                  .dblclick(function (e) {
                                      e.preventDefault();
                                      if (options.formSettings.ssoStatus === "sso_only") {
                                          $(this).siblings(".login-sso-selector").hide().siblings("form").show();
                                      }
                                  })
                            : ""
                    )
                    .append(options.formSettings.loginHTML)
                    .append(
                        options.formSettings.ssoStatus === "sso_only" ||
                            options.formSettings.ssoStatus === "sso_enabled"
                            ? $("<div />")
                                  .addClass("login-sso-selector")
                                  .append(
                                      '<a href="/ssosp" class="button admin_dialog_button-primary admin_login_sso">Log in using ' +
                                          ssoType +
                                          "</a>"
                                  )
                                  .append(
                                      options.formSettings.ssoStatus === "sso_only"
                                          ? ""
                                          : $(
                                                '<a href="#" class="button admin_login_website">Log in to the website directly</a>'
                                            ).click(function (e) {
                                                e.preventDefault();
                                                $(this)
                                                    .parent()
                                                    .hide()
                                                    .siblings("form, .login-forgotten-form-container")
                                                    .show();
                                                $(".login-input-form-fields").show();
                                            })
                                  )
                            : ""
                    )
                    .append(
                        $("<form novalidate/>")
                            .addClass("login-input-form")
                            .append(options.formSettings.inputSettings.preHTML)
                            .append(
                                '<input type="hidden" name="loginRedirectURL" id="loginRedirectURL" value="' +
                                    options.redirectURL1 +
                                    '" />'
                            )
                            .append(
                                options.minimal === false
                                    ? $("<div />")
                                          .addClass("login-input-form-div")
                                          .append(
                                              $("<div />")
                                                  .addClass("login-inputArea")
                                                  .append(
                                                      $("<p />")
                                                          .addClass("admin_field")
                                                          .addClass("admin_field-icon")
                                                          .append(
                                                              $("<label />")
                                                                  .append('<i class="fa fa-user" />')
                                                                  .attr(
                                                                      "for",
                                                                      "login-input-username_" + $.e4eLogin.loginCount
                                                                  )
                                                          )
                                                          .append(
                                                              $("<input />")
                                                                  .addClass("login-input-username-input")
                                                                  .attr({
                                                                      id:
                                                                          "login-input-username_" +
                                                                          $.e4eLogin.loginCount,
                                                                      type: "text",
                                                                      autocorrect: "off",
                                                                      autocapitalize: "none",
                                                                      name: "login-input-username-field",
                                                                      placeholder: "Email Address",
                                                                      "aria-label": "Email Address",
                                                                      "aria-required": "true",
                                                                      autocomplete: "username",
                                                                  })
                                                          )
                                                  )
                                                  .append(
                                                      $("<p />")
                                                          .addClass("admin_field")
                                                          .addClass("admin_field-icon")
                                                          .append(
                                                              $("<label />")
                                                                  .append('<i class="fa fa-lock" />')
                                                                  .attr(
                                                                      "for",
                                                                      "login-input-password_" + $.e4eLogin.loginCount
                                                                  )
                                                          )
                                                          .append(
                                                              $("<input />")
                                                                  .addClass("login-input-password-input")
                                                                  .attr({
                                                                      id:
                                                                          "login-input-password_" +
                                                                          $.e4eLogin.loginCount,
                                                                      type: "password",
                                                                      name: "login-input-password-field",
                                                                      placeholder: "Password",
                                                                      "aria-label": "Password",
                                                                      "aria-required": "true",
                                                                      autocomplete: "current-password",
                                                                  })
                                                          )
                                                  )
                                                  .append(
                                                      $("<p />")
                                                          .addClass("admin_field")
                                                          .addClass("admin_field-btn")
                                                          .append(
                                                              $("<input />")
                                                                  .addClass("login-input-login-button")
                                                                  .attr({ type: "submit", value: "Login" })
                                                          )
                                                  )
                                                  .append(
                                                      options.formSettings.signup === true
                                                          ? $("<a />")
                                                                .addClass("login-signup-link")
                                                                .attr({
                                                                    href:
                                                                        "/users/signup.asp?pid=0" +
                                                                        (options.formSettings.redirectOnSignup
                                                                            ? "&redir=" +
                                                                              options.formSettings.redirectOnSignup
                                                                            : ""),
                                                                    title: "Signup as a new user",
                                                                })
                                                                .append("Sign Up")
                                                          : $("<a />")
                                                                .addClass("login-signup-link")
                                                                .attr({ href: "#" })
                                                                .append("&nbsp;")
                                                  )
                                                  .append(
                                                      $('<a href="#" />')
                                                          .addClass("login-help-link")
                                                          .text(options.formSettings.forgottenButtonHTML)
                                                          .on("click", function () {
                                                              $(".login-input-form").hide();
                                                              $(".login-forgotten-form").show();
                                                              $(".admin_message-error").hide();
                                                          })
                                                  )
                                          )
                                    : $("<div />")
                                          .addClass("login-input-form-fields")
                                          .append(options.formSettings.loginHTML)
                                          .append(
                                              $("<p />")
                                                  .addClass("login-input-username")
                                                  .append(
                                                      $("<label />")
                                                          .append("Email Address:")
                                                          .attr("for", "login-input-username_" + $.e4eLogin.loginCount)
                                                  )
                                                  .append(
                                                      $("<input />")
                                                          .addClass("login-input-username-input")
                                                          .attr({
                                                              id: "login-input-username_" + $.e4eLogin.loginCount,
                                                              type: "text",
                                                              name: "login-input-username-field",
                                                              placeholder: "Email Address",
                                                              "aria-label": "Email Address",
                                                              "aria-required": "true",
                                                              autocomplete: "username",
                                                          })
                                                  )
                                          )
                                          .append(
                                              $("<p />")
                                                  .addClass("login-input-password")
                                                  .append(
                                                      $("<label />")
                                                          .append("Password:")
                                                          .attr("for", "login-input-password_" + $.e4eLogin.loginCount)
                                                  )
                                                  .append(
                                                      $("<input />")
                                                          .addClass("login-input-password-input")
                                                          .attr({
                                                              id: "login-input-password_" + $.e4eLogin.loginCount,
                                                              type: "password",
                                                              name: "login-input-password-field",
                                                              "aria-label": "Password",
                                                              "aria-required": "true",
                                                              autocomplete: "current-password",
                                                          })
                                                  )
                                          )
                                          .append(
                                              $("<p />")
                                                  .addClass("login-input-login")
                                                  .append(
                                                      $("<input />")
                                                          .addClass("login-input-login-button")
                                                          .attr({ type: "submit", value: "Login" })
                                                  )
                                                  .append(
                                                      options.formSettings.signup === true
                                                          ? $("<a />")
                                                                .addClass("login-signup-link btn")
                                                                .attr({
                                                                    href:
                                                                        "/users/signup.asp?pid=0" +
                                                                        (options.formSettings.redirectOnSignup
                                                                            ? "&redir=" +
                                                                              options.formSettings.redirectOnSignup
                                                                            : ""),
                                                                    title: "Signup as a new user",
                                                                })
                                                                .append("Sign Up")
                                                          : $("<div />")
                                                  )
                                          )
                            )
                    )
                    .append(
                        options.formSettings.forgottenLink === true
                            ? $("<span />")
                                  .append($("<hr />").addClass("login-hr"))
                                  .append(
                                      $("<p />")
                                          .addClass("login-forgotten-link")
                                          .append(
                                              $("<a />")
                                                  .append("Click here to reset your password")
                                                  .attr({
                                                      href: "/admin/users/resetPassword.asp",
                                                      title: "reset your password",
                                                  })
                                                  .click(function (evt) {
                                                      evt.preventDefault();
                                                  })
                                          )
                                  )
                            : options.formSettings.forgottenInput === true
                              ? (options.minimal === true
                                    ? $("<div />")
                                          .addClass("login-forgotten-form-container minimal")
                                          .append(
                                              $(
                                                  '<a id="login-forgotten-form-anchor" href="#login-forgotten-form-anchor">Forgotten your password?</a>'
                                              ).click(function (e) {
                                                  e.preventDefault();
                                                  $(this).siblings("form").toggle();
                                                  $(this).hide().parent().prev("form").hide();
                                              })
                                          )
                                    : $("<div />")
                                ).append(
                                    $("<form novalidate/>")
                                        .css(options.minimal === true ? { display: "none" } : {})
                                        .submit(function (e) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            $(".login-forgotten-input")
                                                .removeAttr("aria-invalid")
                                                .removeAttr("aria-errormessage");
                                            if ($(".login-forgotten-input").val() == "") {
                                                $.e4eLogin.doError(
                                                    $(".login-forgotten-input", this),
                                                    "You must enter your email address.",
                                                    false
                                                );
                                                $(".login-forgotten-input", this)
                                                    .attr("aria-invalid", true)
                                                    .attr("aria-errormessage", "admin_login_message")
                                                    .stop(true, true)
                                                    .animate({ backgroundColor: "#FF5F5F" }, 200, function () {
                                                        $(this).animate(
                                                            { backgroundColor: "#ffffff" },
                                                            200,
                                                            function () {
                                                                $(this).animate(
                                                                    { backgroundColor: "#FF5F5F" },
                                                                    200,
                                                                    function () {
                                                                        $(this).animate(
                                                                            { backgroundColor: "#ffffff" },
                                                                            200
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    });
                                                return false;
                                            }
                                            $.e4eLogin.doForgotten($(this));
                                        })
                                        .addClass("login-forgotten-form")
                                        .append(options.formSettings.forgottenInputSettings.preHTML)
                                        .append(
                                            $("<p />")
                                                .addClass("admin_field")
                                                .append(
                                                    $("<input />")
                                                        .addClass("login-forgotten-input login-input-username-input")
                                                        .attr({
                                                            type: "text",
                                                            name: "login-forgotten-input",
                                                            placeholder: "Email Address",
                                                            autocorrect: "off",
                                                            autocapitalize: "none",
                                                            "aria-label": "Email Address",
                                                            "aria-required": "true",
                                                            autocomplete: "username",
                                                        })
                                                )
                                        )
                                        .append(
                                            $("<p />")
                                                .addClass("admin_field")
                                                .addClass("admin_field-btn")
                                                .append(
                                                    $("<input />")
                                                        .addClass("login-forgotten-button")
                                                        .attr({ type: "submit", value: "Reset Password" })
                                                )
                                        )
                                        .append(
                                            $('<a href="#" />')
                                                .addClass("login-help-link login-help-return")
                                                .text("Return to Login")
                                                .on("click", function (e) {
                                                    e.preventDefault();
                                                    $(".login-post-message").empty();
                                                    $(".login-forgotten-form").hide().siblings().show();
                                                    $(".login-input-form").show();
                                                })
                                        )
                                )
                              : ""
                    )
            )
            .find("form.login-input-form")
            .submit(function (evt) {
                evt.preventDefault();
                $(".login-input-username-input", this).removeAttr("aria-invalid").removeAttr("aria-errormessage");
                $(".login-input-password-input", this).removeAttr("aria-invalid").removeAttr("aria-errormessage");
                if ($(".login-input-username-input", this).val() == "") {
                    $.e4eLogin.doError($(this), "You must enter your email address.", false);
                    $(".login-input-username-input", this)
                        .attr("aria-invalid", true)
                        .attr("aria-errormessage", "admin_login_message")
                        .stop(true, true)
                        .animate({ backgroundColor: "#FF5F5F" }, 200, function () {
                            $(this).animate({ backgroundColor: "#ffffff" }, 200, function () {
                                $(this).animate({ backgroundColor: "#FF5F5F" }, 200, function () {
                                    $(this).animate({ backgroundColor: "#ffffff" }, 200);
                                });
                            });
                        });
                    return;
                } else if ($(".login-input-username-input", this).val().toLowerCase() === "juniper") {
                    window.location = "/ssosp?internal=true";
                    return;
                }
                if ($(".login-input-password-input", this).val() == "") {
                    $.e4eLogin.doError($(this), "You must enter your password.", false);
                    $(".login-input-password-input", this)
                        .attr("aria-invalid", true)
                        .attr("aria-errormessage", "admin_login_message")
                        .stop(true, true)
                        .animate({ backgroundColor: "#FF5F5F" }, 200, function () {
                            $(this).animate({ backgroundColor: "#ffffff" }, 200, function () {
                                $(this).animate({ backgroundColor: "#FF5F5F" }, 200, function () {
                                    $(this).animate({ backgroundColor: "#ffffff" }, 200);
                                });
                            });
                        });
                    return;
                }
                $.e4eLogin.doLogin($(this), options.formSettings.redirectURL);
            });
        $(".admin_dialog_overlay").addClass("admin_dialog_overlay-fadein");
        $(".admin_dialog_box").addClass("admin_dialog_box-slidein");
        var handleEscape = function (e) {
            if (e.key === "Escape") {
                $.e4eLogin.doClose($(".admin_dialog_overlay"));
                $("html").off("keydown", handleEscape);
            }
        };
        $("html").on("keydown", handleEscape);
    },
    doClose: function (elem) {
        $(".admin_dialog_box").removeClass("admin_dialog_box-slidein");
        $(".admin_dialog_overlay").removeClass("admin_dialog_overlay-fadein");
        setTimeout(function () {
            $("#admin_dialog").remove();
        }, 1000);
        return this;
    },
    doLogin: function (formElem, strRedirectURL) {
        $(".login-post-message", formElem).remove();
        formElem.closest(".admin_dialog_box").removeClass("admin_dialog_box-error");
        if ($(".login-input-username-input", formElem).val().toLowerCase() == "juniper") {
            $.ajax({
                url: "https://office.e4education.co.uk/autoLogin/home",
                dataType: "jsonp",
                type: "GET",
                success: function (data) {
                    if (data.status === true) {
                        $.ajax({
                            url: "/admin/login/login_ajax.asp",
                            dataType: "json",
                            data: { token: data.token },
                            type: "POST",
                            success: function (data) {
                                if (data.status == "success" || data.status == "Success") {
                                    $.e4eLogin.doError(formElem, "You have successfully logged in.", true);
                                    $("body").css({ cursor: "wait" });
                                    currLocation = "" + window.location;
                                    currLocation = currLocation.split("#")[0];
                                    currLocation = currLocation.split("&login=true")[0];
                                    window.location = currLocation;
                                } else if (data.status == "disabled") {
                                    $.e4eLogin.doError(formElem, data.message, false);
                                } else {
                                    $.e4eLogin.doError(
                                        formElem,
                                        "Sorry but either the email address or password you supplied doesn't match our records.<br>If you have recently updated your user account please try your email address.",
                                        false
                                    );
                                    formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                                }
                            },
                            error: function () {
                                $.e4eLogin.doError(
                                    formElem,
                                    "Sorry there was an error trying to log you in. Please try again.",
                                    false
                                );
                                formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                            },
                        });
                    } else {
                        $.e4eLogin.doError(
                            formElem,
                            "Sorry there was an error trying to log you in. Please try again.",
                            false
                        );
                        formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                    }
                },
                error: function () {
                    $.e4eLogin.doError(
                        formElem,
                        "Sorry there was an error trying to log you in. Please try again.",
                        false
                    );
                    formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                },
            });
        } else {
            $.ajax({
                url: "/users/login_ajax.asp",
                dataType: "json",
                data: {
                    username: $(".login-input-username-input", formElem).val(),
                    password: $(".login-input-password-input", formElem).val(),
                    totp: $(".login-input-totp-input", formElem).val(),
                },
                type: "POST",
                success: function (data) {
                    if (data.status == "success" || data.status == "Success") {
                        $.e4eLogin.doError(formElem, "You have successfully logged in.", true);
                        $("body").css({ cursor: "wait" });
                        var currLocation;
                        var ssolink = window.location.search.match(/ssolink=([^&]+)/);
                        if (ssolink && ssolink.length === 2) {
                            currLocation = "/admin/login/remote/link.asp?sso=1&link=" + ssolink[1];
                        } else if (data.redirect) {
                            currLocation = data.redirect;
                        } else {
                            if ($("#loginRedirectURL", formElem).val() != undefined) {
                                currLocation = $("#loginRedirectURL", formElem).val();
                            } else {
                                currLocation = "" + window.location;
                            }
                            currLocation = currLocation.split("#")[0];
                            currLocation = currLocation.split("&login=true")[0];
                            if (currLocation.indexOf("postLogin=true") === -1) {
                                currLocation += (currLocation.indexOf("?") > -1 ? "&" : "?") + "postLogin=true";
                            }
                        }
                        setTimeout(function () {
                            window.location = currLocation;
                        }, 0);
                    } else if (data.status == "totp_req") {
                        if ($(".admin_field-totp").length < 1) {
                            $.e4eLogin.doShowTotp();
                        }
                    } else if (data.status == "totp_fail") {
                        $.e4eLogin.doError(
                            formElem,
                            "The 2FA code provided could not be validated, please try again or contact support if you continue to experience this problem.",
                            false
                        );
                        formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                    } else if (data.status == "disabled") {
                        $.e4eLogin.doError(formElem, data.message, false);
                    } else {
                        $.e4eLogin.doError(
                            formElem,
                            "Sorry but either the email address or password you supplied doesn't match our records.<br>If you have recently updated your user account please try your email address.",
                            false
                        );
                        formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $.e4eLogin.doError(
                        formElem,
                        "Sorry there was an error trying to log you in. Please try again. " +
                            textStatus +
                            " - " +
                            jqXHR.responseText,
                        false
                    );
                    formElem.closest(".admin_dialog_box").addClass("admin_dialog_box-error");
                },
            });
        }
    },
    doError: function (formElem, strError, blnSuccess) {
        $(".login-post-message").remove();
        $(formElem).before(
            $("<div />")
                .addClass("login-post-message")
                .show()
                .append(
                    $('<div id="admin_login_message" role="status" />')
                        .addClass("admin_message")
                        .addClass("admin_message-" + (blnSuccess ? "success" : "error"))
                        .append(strError)
                )
        );
    },
    doShowTotp: function () {
        $(".login-input-login-button")
            .parent()
            .before(
                $("<p />")
                    .addClass("admin_field")
                    .addClass("admin_field-icon")
                    .addClass("admin_field-totp")
                    .append(
                        $("<label />")
                            .append('<i class="fa fa-key" />')
                            .attr("for", "login-input-totp" + $.e4eLogin.loginCount)
                    )
                    .append(
                        $("<input />")
                            .addClass("login-input-totp-input")
                            .attr({
                                id: "login-input-totp" + $.e4eLogin.loginCount,
                                type: "text",
                                name: "login-input-totp-field",
                                placeholder: "2FA Code",
                            })
                    )
                    .append(
                        $("<p />")
                            .addClass("admin_email_totp_button")
                            .append(
                                $("<a />")
                                    .attr({ id: "cmdSendTotpEmail", href: "#" })
                                    .text("Send 2FA code by email")
                                    .click(function (e) {
                                        e.preventDefault();
                                        $.ajax({
                                            url: "/users/login_ajax.asp?totpemail=true",
                                            dataType: "json",
                                            type: "POST",
                                            data: {
                                                username: $(
                                                    ".login-input-username-input",
                                                    "form.login-input-form"
                                                ).val(),
                                            },
                                            success: function (data) {
                                                if (data.status == "totp_email_sent") {
                                                    $.e4eLogin.doError(
                                                        $("form.login-input-form"),
                                                        "We&acute;ve sent your code to the email associated with the user account. Please ensure that <strong>noreply@juniperwebsites.co.uk</strong> is added to your safe senders list.",
                                                        true
                                                    );
                                                } else {
                                                    $.e4eLogin.doError(
                                                        $("form.login-input-form"),
                                                        data.message
                                                            ? data.message
                                                            : "Sorry but we couldn&acute;t find the user specified.",
                                                        false
                                                    );
                                                }
                                            },
                                            error: function () {
                                                $.e4eLogin.doError(
                                                    "form.login-input-form",
                                                    "Sorry but we couldn&acute;t send your code, please try again.",
                                                    false
                                                );
                                            },
                                        });
                                    })
                            )
                    )
            );
    },
    doForgotten: function (formElem) {
        $.ajax({
            url: "/admin/login/password_reset.asp",
            dataType: "json",
            data: { username: $(".login-forgotten-input", formElem).val() },
            type: "POST",
            success: function (data) {
                if (data.status == "success") {
                    $(formElem)[0].children[1].style.display = "none";
                    $.e4eLogin.doError(
                        $(".login-forgotten-input", formElem),
                        '<p>We&apos;ve sent a password reminder to the email associated with the user account. Please ensure that <strong>noreply@juniperwebsites.co.uk</strong> is added to your safe senders list.</p><p class="admin_field admin_field-btn"><button class="login-input-login-button login-input-login-return">Return to Login</button></p>',
                        true
                    );
                    $(".login-forgotten-input", formElem).hide();
                    $(".login-forgotten-button", formElem).hide();
                    $(".login-help-return").hide();
                    $(".login-input-login-return", formElem).on("click", function () {
                        $(".login-post-message").empty();
                        $(".login-forgotten-form").hide();
                        $(formElem)[0].children[1].style.display = "block";
                        $(".login-input-form").show();
                        $(".login-forgotten-input", formElem).show();
                        $(".login-forgotten-button", formElem).show();
                        $(".login-help-return").show();
                    });
                } else {
                    $.e4eLogin.doError(
                        $(".login-forgotten-input", formElem),
                        data.message ? data.message : "Sorry but we couldn&acute;t find the user specified.",
                        false
                    );
                }
            },
            error: function () {
                $.e4eLogin.doError(formElem, "Sorry but we couldn&acute;t find the user specified.", false);
            },
        });
    },
    rePosition: function (elem) {},
};
