package com.example.flowableleave.controller;

import com.example.flowableleave.service.LeaveService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leave")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // 用户提交请假
    @PostMapping("/apply")
    public Map<String,Object> applyLeave(@RequestBody Map<String,Object> params) {
        String userId = (String) params.get("userId");

        // 将 days 转为 Integer
        Object daysObj = params.get("days");
        Integer days = null;
        if (daysObj instanceof Integer) {
            days = (Integer) daysObj;
        } else if (daysObj instanceof String) {
            days = Integer.valueOf((String) daysObj);
        }

        String reason = (String) params.get("reason");
        return leaveService.applyLeave(userId, days, reason);
    }

    // 用户查询自己的流程
    @GetMapping("/my-requests")
    public List<Map<String,Object>> myRequests(@RequestParam String userId) {
        return leaveService.getUserProcesses(userId);
    }

    // 查询待办任务（经理/HR）
    @GetMapping("/tasks")
    public List<Map<String,Object>> tasks(@RequestParam String assignee) {
        return leaveService.getTasks(assignee);
    }

    // 完成任务
    @PostMapping("/tasks/{taskId}/complete")
    public void completeTask(@PathVariable String taskId, @RequestParam boolean approved) {
        leaveService.completeTask(taskId, approved);
    }

    // 管理员查看所有流程
    @GetMapping("/processes")
    public List<Map<String,Object>> allProcesses() {
        return leaveService.getAllProcesses();
    }
}
