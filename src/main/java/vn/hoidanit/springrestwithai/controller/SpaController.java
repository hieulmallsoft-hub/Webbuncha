package vn.hoidanit.springrestwithai.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/menu",
            "/menu/{id}",
            "/cart",
            "/checkout",
            "/login",
            "/register",
            "/account",
            "/history",
            "/reviews",
            "/about",
            "/admin",
            "/admin/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
