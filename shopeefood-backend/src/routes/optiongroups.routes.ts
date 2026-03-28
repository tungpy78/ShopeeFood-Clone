import { Router } from "express";
import { createOption, deleteOptionGroup, updateOptionGroup } from "../controllers/OptionGroupController";
import { authenticate } from "../middlewares/authMiddleware";

const optionGroup = Router();

optionGroup.post('/:groupId/options',authenticate, createOption)
optionGroup.put('/:id',authenticate, updateOptionGroup);
optionGroup.delete('/:id',authenticate, deleteOptionGroup);


export default optionGroup;