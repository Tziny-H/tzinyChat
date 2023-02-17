/*
 Navicat Premium Data Transfer

 Source Server         : hw_yun
 Source Server Type    : MySQL
 Source Server Version : 80024
 Source Host           : 139.159.136.252:3306
 Source Schema         : ys_project_api

 Target Server Type    : MySQL
 Target Server Version : 80024
 File Encoding         : 65001

 Date: 17/02/2023 15:26:16
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for char_message
-- ----------------------------
DROP TABLE IF EXISTS `char_message`;
CREATE TABLE `char_message`  (
  `char_id` int NOT NULL AUTO_INCREMENT COMMENT '信息id',
  `uid` int NOT NULL COMMENT '发送用户id',
  `center` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户发送信息',
  `sid` int NOT NULL COMMENT '接收用户信息',
  `date` datetime NOT NULL COMMENT '发送时间',
  `room` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'socket连接房号',
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '判断是文本还是图片',
  PRIMARY KEY (`char_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 245 CHARACTER SET = utf8 COLLATE = utf8_bin ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户名',
  `user_password` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户密码',
  `user_email` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户邮箱',
  `newdate` datetime NOT NULL COMMENT '用户注册时间',
  `personality_autograph` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '这个用户很懒，什么都未留下' COMMENT '用户个性签名',
  `follow` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '[]' COMMENT '用户关注',
  `fans` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '[]' COMMENT '用户粉丝',
  `message_arr` varchar(3111) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '[]' COMMENT '用户消息列表',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户头像',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8 COLLATE = utf8_bin ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
