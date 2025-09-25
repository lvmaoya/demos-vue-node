package com.example.flowableleave.service;

import org.flowable.common.engine.impl.identity.Authentication;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.engine.history.HistoricProcessInstance;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final RuntimeService runtimeService;
    private final TaskService taskService;

    public LeaveService(RuntimeService runtimeService, TaskService taskService) {
        this.runtimeService = runtimeService;
        this.taskService = taskService;
    }

    // 用户提交请假
    public Map<String, Object> applyLeave(String userId, Integer days, String reason) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("days", days);
        vars.put("reason", reason);

        // 设置启动人
        Authentication.setAuthenticatedUserId(userId);
        ProcessInstance instance = runtimeService.startProcessInstanceByKey("leaveProcess", null, vars);
        Authentication.setAuthenticatedUserId(null);

        return Map.of(
                "processInstanceId", instance.getId(),
                "status", "申请中",
                "days", days,
                "reason", reason
        );
    }

    // 根据用户查询自己的流程
    public List<Map<String, Object>> getUserProcesses(String userId) {
        return runtimeService.createProcessInstanceQuery()
                .startedBy(userId)
                .list()
                .stream()
                .map(pi -> {
                    Map<String, Object> vars = runtimeService.getVariables(pi.getId());
                    return Map.of(
                            "processInstanceId", pi.getId(),
                            "status", "审批中",
                            "days", vars.get("days"),
                            "reason", vars.get("reason")
                    );
                })
                .collect(Collectors.toList());
    }

    // 查询待办任务
    public List<Map<String, Object>> getTasks(String assignee) {
        return taskService.createTaskQuery()
                .taskAssignee(assignee)
                .list()
                .stream()
                .map(t -> {
                    Map<String, Object> vars = taskService.getVariables(t.getId());
                    return Map.of(
                            "id", t.getId(),
                            "name", t.getName(),
                            "processInstanceId", t.getProcessInstanceId(),
                            "startUserId", runtimeService.createProcessInstanceQuery()
                                    .processInstanceId(t.getProcessInstanceId()).singleResult().getStartUserId(),
                            "days", vars.get("days"),
                            "reason", vars.get("reason")
                    );
                })
                .collect(Collectors.toList());
    }

    // 完成任务（审批）
    public void completeTask(String taskId, boolean approved) {
        taskService.complete(taskId, Map.of("approved", approved));
    }

    // 管理员查看所有流程
    public List<Map<String, Object>> getAllProcesses() {
        return runtimeService.createProcessInstanceQuery().list()
                .stream()
                .map(pi -> {
                    Map<String, Object> vars = runtimeService.getVariables(pi.getId());
                    return Map.of(
                            "id", pi.getId(),
                            "startUserId", pi.getStartUserId(),
                            "status", "审批中",
                            "days", vars.get("days"),
                            "reason", vars.get("reason")
                    );
                }).collect(Collectors.toList());
    }
}
