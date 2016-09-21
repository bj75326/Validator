/**
 * Created by Bill on 2016/9/21.
 */
var Bin = {
    on: function (element, type, handler, userCapture) {
        if (document.addEventListener) {
            element.addEventListener(type, handler, userCapture);
        } else if (document.attachEvent) {
            element.attachEvent("on" + type, handler);
        }
    },

    off: function (element, type, handler, userCapture) {
        if (document.removeEventListener) {
            element.removeEventListener(type, handler, userCapture);
        } else if (document.detachEvent) {
            element.detachEvent("on" + type, handler);
        }
    },

    eventDispatch: function (element, type, customProperty) {
        if (document.fireEvent) {
            var event = document.createEventObject();
            event.eventType = type;
            event.dispatchFlag = true;
            element.fireEvent("on" + type, event);
        } else if (document.dispatchEvent) {
            var event = new MouseEvent("click", {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            event.dispatchFlag = true;
            if (customProperty) {
                for (var key in customProperty) {
                    if (!(key in event)) {
                        event[key] = customProperty[key];
                    }
                }
            }
            element.dispatchEvent(event);
        }
    },

    ready: function (fn) {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", function () {
                document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                fn();
            }, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState == "completed") {
                    document.detachEvent("onreadystatechange", arguments.callee);
                    fn();
                }
            });
        }
    },

    trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/, '');
    },

    parseURL: function (url) {
        var result = {};
        var oA = document.createElement("a");
        oA.href = url;
        result.source = url;
        result.protocol = oA.protocol.replace(/:/, "");
        result.hostname = oA.hostname;
        result.port = oA.port;
        result.pathname = oA.pathname;
        result.querys = {};
        if (oA.search) {
            var aQuerys = oA.search.substring(1).split("&");
            for (var i = 0, len = aQuerys.length; i < len; i++) {
                var tmp = aQuerys[i].split("=");
                result.querys[tmp[0]] = tmp[1];
            }
        }
        return result;
    },

    parseHTMLString: function (ctx, html) {
        var divTemp = document.createElement("div");
        var fragment = document.createDocumentFragment();
        var nodes;

        divTemp.innerHTML = html;
        nodes = divTemp.childNodes;
        for (var i = 0, len = nodes.length; i < len; i++) {
            fragment.appendChild(nodes[i].cloneNode(true));
        }
        ctx.appendChild(fragment);

        nodes = null;
        fragment = null;
    },

    mixin: function (dest /* , any numbers of object*/) {
        var sources = Array.prototype.slice.call(arguments, 1);

        for (var i = 0, len = sources.length; i < len; i++) {
            var source = sources[i];
            for (var key in source) {
                dest[key] = source[key];
            }
        }

        return dest;
    },

    cssCapture: function (element, attr) {
        if (element.currentStyle) {
            return element.currentStyle[attr];
        } else {
            return getComputedStyle(element, null)[attr];
        }
    },

    scroll: function (element, target, callback) {  //simple version

        var browserInfo = Bin.getBrowserInfo();

        if (element.nodeName.toLowerCase() === "body" && browserInfo.browser !== "chrome") {
            var curr = document.documentElement.scrollTop;
        } else {
            var curr = element.scrollTop;
        }

        //scope
        if (element.nodeName.toLowerCase() === "body") {
            var scope = document.documentElement.scrollHeight - window.innerHeight;
        } else {
            var scope = element.scrollHeight - element.clientHeight;
        }

        if (target > scope) target = scope;
        if (target < 0) target = 0;

        //each frame move 16px...
        var frameTarget;
        var stop = false;

        if (Math.abs(target - curr) < 16) {
            frameTarget = target;
            stop = true;
        } else {
            var tmp = target > curr ? 16 : -16;
            frameTarget = curr + tmp;
        }

        window.requestAnimationFrame(function () {

            if (element.nodeName.toLowerCase() === "body" && browserInfo.browser !== "chrome") {
                document.documentElement.scrollTop = frameTarget;
            } else {
                element.scrollTop = frameTarget;
            }

            if (!stop) {
                Bin.scroll(element, target, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });

    },

    getPos: function (element) {
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var pos = element.getBoundingClientRect();
        return {
            top: pos.top + scrollY,
            right: pos.right + scrollX,
            bottom: pos.bottom + scrollY,
            left: pos.left + scrollX
        };
    },

    pageX: function (element) {
        return element.offsetLeft + (element.offsetParent ? arguments.callee(element.offsetParent) : 0);
    },

    pageY: function (element) {
        return element.offsetTop + (element.offsetParent ? arguments.callee(element.offsetParent) : 0);
    },

    getBrowserInfo: function () {
        var result = {};

        var m = window.navigator.userAgent.toLowerCase().match(/(msie|firefox|chrome|opera|version).*?([\d.]+)/);
        m[1].replace(/version/, 'safari');

        result.browser = m[1];
        result.version = m[2];

        return result;

    },

    customAjaxCall: function(method, data, url, async){  //return a Promise Object
        if(method.toLowerCase() == "get"){
            return new Promise(function(resolve, reject){
                var xhr = new XMLHttpRequest();
                xhr.timeout = 3000;
                xhr.responseType = 'json'; //"blob", "arrayBuffer", "document", "text"
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        if(xhr.status == 200 || xhr.status == 304){
                            resolve(xhr.response);
                        }
                    }else{
                        reject("http_status_" + xhr.status);
                    }
                };
                xhr.open("GET", url, async);
                xhr.send(null);
            });
        }else if(method.toLowerCase() == "post"){
            return new Promise(function(resolve, reject){
                var xhr = new XMLHttpRequest();
                xhr.timeout = 3000;
                xhr.responseType = "json";
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        if(xhr.status == 200 || xhr.status == 304){
                            resolve(xhr.response);
                        }else{
                            reject("http_status_" + xhr.status);
                        }
                    }
                };
                xhr.open("POST", url, async);  // readyState == 1
                //xhr.setRequestHeader("Content-Type", "application/json");
                //xhr.setRequestHeader("Content-Type", "mutipart/form-data");
                xhr.send(data); // readyState == 2
            });
        }
    }

};

Bin.ready(function () {

    var errMsg = {

        //required check
        required: {
            msg: "This field is required.",
            test: function (obj) {
                // logic for checkbox & radio
                if (obj.nodeName.toLowerCase() !== "input") {
                    var num = 1;
                    if (obj.dataset.condition) {
                        num = +obj.dataset.condition;
                    }
                    var aInputs = obj.querySelectorAll("input");
                    var checkedNum = 0;
                    for (var i = 0, len = aInputs.length; i < len; i++) {
                        if (aInputs[i].checked) {
                            checkedNum++;
                        }
                    }
                    if (checkedNum < num) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return obj.value.length > 0 && obj.value != obj.defaultValue;
                }
            }
        },

        //email format check
        email: {
            msg: "Not a valid email address",
            test: function (obj) {
                return !obj.value || /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/i.test(obj.value);
            }
        },

        //phone number format check
        phone: {
            msg: "Not a valid phone number",
            test: function (obj) {
                if (obj.value.length > 0) {
                    if (/^1\d{2}\s?\d{4}\s?\d{4}$/.test(obj.value)) {
                        var arr = /(\d{3}).*(\d{4}).*(\d{4})/.exec(obj.value);
                        obj.value = arr[1] + " " + arr[2] + " " + arr[3];
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
        },

        //fix phone number format check
        phone2: {
            msg: "Not a valid fixed phone number",
            test: function (obj) {
                if (obj.value.length > 0) {
                    if (/^0\d{2,3}-?\d{7,8}$/.test(obj.value)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
        },

        //date format check [YYYY/MM/DD]
        date: {
            msg: "Not a valid date.",
            test: function (obj) {
                return !obj.value || /^\d{2,4}-\d{2}-\d{2}$/.test(obj.value);
            }
        },

        //URL format check
        url: {
            msg: "Not a valid URL.",
            test: function (obj) {
                return !obj.value || /^https?:\/\/([a-z0-9]+\.)+[a-z0-9]{2,4}.*$/.test(obj.value);
            }
        },

        userName: {
            msg: "Invalid user name. A valid user name should onl" +
            "y be at least 3 and at most 16 alphanumeric characte" +
            "rs or numbers or '_', please check again.",
            test: function (obj) {
                return !obj.value || /^[a-zA-Z0-9_]{3,16}$/.test(obj.value);
            }
        },

        password: {
            //要求：密码可以为数字，字母，特殊字符中的两种或者三种。
            //注意：1.密码不可以为纯数字。
            //2.密码不可以为纯字母。
            //3.密码不可以为纯特殊字符。
            //4.密码最少要六位。
            msg: "Invalid Password. A valid password should only " +
            "at least 6 by digital characters, special characters of two of the three.",
            test: function (obj) {
                return !obj.value || /(?!\d+$)(?![a-zA-Z]+$)(?![_#@]+$).{6,}/.test(obj.value);
            }
        },

        password2: {
            msg: "Password mismatch, pls check again.",
            test: function (obj) {
                var id = obj.dataset.confirm;
                var password = document.querySelector("#" + id).value;
                //if(obj.value && password && obj.value === password){
                if (obj.value === password) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        name: {
            //要求：真实姓名可以是汉字，也可以是字母，但是不能两者都有，也不能包含任何符号和数字
            //注意：1.如果是英文名,可以允许英文名字中出现空格
            //2.英文名的空格可以是多个，但是不能连续出现多个
            //3.汉字不能出现空格
            msg: "Not a valid name.",
            test: function (obj) {
                return !obj.value || /^([\u4e00-\u9fa5]+|([a-zA-Z]+\s?)+)$/.test(obj.value);
            }
        }
    };

    //init Form Group
    var initFormGroup = function (elem) {
        if (elem.nodeName.toLowerCase() === "input") {
            //elem - input
            var formGroupElem = elem.parentNode;
            var elemClass = elem.getAttribute("class") || "";
            if (elemClass.indexOf("validate-error") > -1) {
                elem.value = "";
                elem.setAttribute("class", elemClass.replace("validate-error", "").replace(/(^\s+)|(\s+$)/g, ""));
                formGroupElem.removeChild(formGroupElem.querySelector("ul.error"));
            }
            if (elemClass.indexOf("validate-success") > -1) {
                elem.setAttribute("class", elemClass.replace("validate-success", "").replace(/(^\s+)|(\s+$)/g, ""));
                formGroupElem.removeChild(formGroupElem.querySelector("span.success"));
            }
        } else if (elem.getAttribute("class").indexOf("checkbox-wrapper") > -1) {
            var formGroupElem = elem.parentNode;
            var tips = formGroupElem.querySelector(".tips");
            if (tips) {
                var tipsClass = tips.getAttribute("class") || "";
                if (tipsClass.indexOf("validate-error") > -1) {
                    tips.setAttribute("class", tipsClass.replace("validate-error", "").replace(/(^\s+) | (\s+$)/g, ""));
                }
            }
        }

    };

    var showError = function (elem, errors) {
        if (elem.nodeName.toLowerCase() === "input") {
            //elem - input
            //errors - [Array]error String
            var formGroupElem = elem.parentNode;
            var elemClass = elem.getAttribute("class") || "";
            if (elemClass.indexOf("validate-error") < 0) {
                elem.setAttribute("class", elemClass.replace(/(^\s+)|(\s+$)/g, "") + " validate-error");
            }
            if (Object.prototype.toString.call(errors).slice(8, -1) === "Array") {
                var html = "<ul class='error'>";
                for (var i = 0, len = errors.length; i < len; i++) {
                    html += "<li class='normal'><i class='fa fa-times-circle' aria-hidden='true'></i>" + errors[i] + "</li>";
                }
                html += "</ul>";
                Bin.parseHTMLString(formGroupElem, html);
            } else {
                var html = "<ul class='error'><li class='normal'><i class='fa fa-times-circle' aria-hidden='true'></i>" + errors + "</li></ul>";
                Bin.parseHTMLString(formGroupElem, html);
            }
        } else if (elem.getAttribute("class").indexOf("checkbox-wrapper") > -1) {
            var fromGroupElem = elem.parentNode;
            var tips = fromGroupElem.querySelector(".tips");
            if (tips) {
                var tipsClass = tips.getAttribute("class") || "";
                if (tipsClass.indexOf("validate-error") < 0) {
                    tips.setAttribute("class", tipsClass.replace(/(^\s+) | (\s+$)/g, "") + " validate-error");
                }
            }
        }

    };

    var showSuccess = function (elem) {
        //elem - input
        var formGroupElem = elem.parentNode;
        var elemClass = elem.getAttribute("class") || "";
        if (elemClass.indexOf("validate-success") < 0) {
            elem.setAttribute("class", elemClass.replace(/(^\s+)|(\s+$)/g, "") + " validate-success");
        }
        var html = "<span class='form-control-feedback pos-for-feedback success'><i class='fa fa-check-circle' aria-hidden='true'></i></span>";
        Bin.parseHTMLString(formGroupElem, html);
    };

    //validation moment
    var moment = {
        "onblur": ["email", "phone", "phone2", "date", "url", "userName", "name", "password", "password2"],
        "onsubmit": ["required"]
    };

    //AMD Export
    var Validate = function (options) {

        /*
         *options = {
         *      errMsg: {},
         *      scope: "",
         *      moment: {
         *          "onblur": [],
         *          "onsubmit": []
         *      },
         *      alert: true/false,
         *      callback: function(){}
         * }
         */

        if (!options) { options = {};}

        //init errList, support self defined errMsg.
        var errList = Bin.mixin({}, errMsg, options.errMsg || {});

        //init scope dom element
        var scope = document.querySelector(options.scope || "[data-validate='check']");

        //init moment
        var moment_list = options.moment || {"onblur": [], "onsubmit": []};
        moment["onblur"].forEach(function (value) {
            if (moment_list["onblur"].indexOf(value) === -1 && moment_list["onsubmit"].indexOf(value) === -1) {
                moment_list["onblur"].push(value);
            }
        });
        moment["onsubmit"].forEach(function (value) {
            if (moment_list["onblur"].indexOf(value) === -1 && moment_list["onsubmit"].indexOf(value) === -1) {
                moment_list["onsubmit"].push(value);
            }
        });

        //init callback
        var callback = options.callback || function(){
                console.log("1");
            };

        //blur event bind
        var aInputs = scope.querySelectorAll("[data-validate]:not([data-validate='submit'])");
        for (var i = 0, len = aInputs.length; i < len; i++) {
            var inputComponent = aInputs[i];
            Bin.on(inputComponent, "focus", function (ev) {
                var event = ev || window.event;
                var target = event.target || event.srcElement;
                initFormGroup(target);
            }, false);

            Bin.on(inputComponent, "blur", function (ev) {
                var event = ev || window.event;
                var target = event.target || event.srcElement;
                var rules = target.dataset.validate.replace(/(^\s+) | (\s+$)/g, "").replace(/\s+/g, " ").split(" ");
                //console.log(rule);
                for (var i = 0, len = rules.length; i < len; i++) {
                    var rule = rules[i];
                    if (moment_list["onblur"].indexOf(rule) > -1 && errList[rule]) {
                        var tmp = errList[rule];
                        if (!tmp.test(target)) {
                            showError(target, tmp.msg);
                            break;
                        }
                    }
                }
                if (i === rules.length && target.value.replace(/(^\s+) | (\s+$)/g, "").length > 0) {
                    showSuccess(target);
                }
            }, false);
        }

        //checkbox & radio
        var checkboxes = scope.querySelectorAll(".checkbox-wrapper input");
        for (var i = 0, len = checkboxes.length; i < len; i++) {
            var checkboxComponent = checkboxes[i];
            Bin.on(checkboxComponent, 'change', function (ev) {
                var event = ev || window.event;
                var target = event.target || event.srcElement;
                initFormGroup(target.parentNode);
            }, false);
        }

        //submit event bind
        var aSubmits = scope.querySelectorAll("[data-validate='submit']");
        for (var i = 0, len = aSubmits.length; i < len; i++) {
            var submitComponent = aSubmits[i];
            Bin.on(submitComponent, "click", function (ev) {
                var event = ev || window.event;
                //check existing errors
                var errors = scope.querySelectorAll(".validate-error");
                if (errors && errors.length > 0) {
                    var xyz = errors[0];
                    if (xyz.getBoundingClientRect().top < 0 || xyz.getBoundingClientRect().bottom > window.innerHeight) {
                        var pos = Bin.getPos(xyz);
                        var target = pos.top - 100;
                        Bin.scroll(document.body, target);
                    }
                    return;
                }
                //aInputs validation.
                for (var i = 0, len = aInputs.length; i < len; i++) {

                    var inputComponent = aInputs[i];
                    var rules = inputComponent.dataset.validate.replace(/(^\s+) | (\s+$)/g, "").replace(/\s+/g, " ").split(" ");
                    for (var j = 0, length = rules.length; j < length; j++) {

                        var rule = rules[j];
                        if (moment_list["onsubmit"].indexOf(rule) > -1 && errList[rule]) {
                            var tmp = errList[rule];
                            if (!tmp.test(inputComponent)) {
                                showError(inputComponent, tmp.msg);
                                break;
                            }
                        }
                    }
                }

                //finally check.
                var errorNum = document.querySelectorAll(".validate-error").length;
                if (errorNum === 0 && callback) {
                    callback();
                }
            }, false);
        }
    };

    Validate({
        callback: function(){
            alert("submitted");
        }
    });
    // return Validate;
});
