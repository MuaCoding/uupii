function Jump_login(url) {
    localStorage.removeItem("openId");
    localStorage.removeItem("user_token");
    localStorage.removeItem("in_exp");

    setTimeout(function() {
        location.href = "login.html" + (url ? ("?url=" + url) : "");
    }, 20);
}

// wechat login
function whether_signin() {
    if (!localStorage.getItem("openId")) {
        return false;
    } else if (!localStorage.getItem("user_token")) {
        return false;
    } else if (!localStorage.getItem("in_exp")) {
        return false;
    } else {
        var payload = localStorage.getItem("user_token").split('.')[1];
        var lsExp = localStorage.getItem("in_exp");
        alert(lsExp)
        var exp = new Date(lsExp);
        var now = new Date();
        if (exp - now <= 0) {
            return false;
        } else {
            var lmt = JSON.parse(atob(payload))["lmt"];
            var nowLmt = new Fingerprint().get();
            if (lmt == nowLmt) {
                return true;
            } else {
                return false;
            }
        }
    }
}

// 多登陆
function whether_login() {
    if (!localStorage.getItem("user_token")) {
        return false;
    }
    // if (!localStorage.getItem("openId")) {
    //     return false;
    // }
    // else if (!localStorage.getItem("in_exp")) {
    //     return false;
    // } 
    // else if (!localStorage.getItem("openId")) {
    //     return false;
    // }
    else {
        var payload = localStorage.getItem("user_token").split('.')[1];
        // var lsExp = localStorage.getItem("7");
        var now = new Date();
        var lsExp = new Date(now.setDate(now.getDate()+7));
        var exp = new Date(lsExp);
        alert(lsExp)
        if (exp - now <= 0) {
            alert(exp)
            return false;
        } else {
            var lmt = JSON.parse(atob(payload))["lmt"];
            var nowLmt = new Fingerprint().get();
            if (lmt == nowLmt) {
                return true;
            } else {
                return false;
            }
        }
    }

    // if (!localStorage.getItem("openId")) {
    //     return false;
    // } else if (!localStorage.getItem("user_token")) {
    //     return false;
    // } else if (!localStorage.getItem("in_exp")) {
    //     return false;
    // } else {
    //     var payload = localStorage.getItem("user_token").split('.')[1];
    //     // var lsExp = localStorage.getItem("in_exp"); //过期时间
    //     var lsExp = new Date() + 7;
    //     var exp = new Date(lsExp);
    //     if (exp - now <= 0) {
    //         return false;
    //     } else {
    //         var lmt = JSON.parse(atob(payload))["lmt"];
    //         var nowLmt = new Fingerprint().get();
    //         if (lmt == nowLmt) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     }
    // }
}