const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, deleteStudent } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const ensureValidId = (id) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new ApiError(400, "Invalid student id");
    }
}

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    return students || [];
}

const getStudentDetail = async (id) => {
    ensureValidId(id);
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const addNewStudent = async (payload) => {
    if (!payload.name || !payload.email) {
        throw new ApiError(400, "Name and email are required fields");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
        throw new ApiError(400, "Invalid email format");
    }

    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw new ApiError(500, result.message);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    if (!payload.userId) {
        throw new ApiError(400, "Student ID is required");
    }
    ensureValidId(payload.userId);
    await checkStudentId(payload.userId);
    if (payload.name && typeof payload.name !== 'string') {
        throw new ApiError(400, "Name must be a string");
    }

    if (payload.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            throw new ApiError(400, "Invalid email format");
        }
    }

    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(500, result.message);
    }

    return { message: result.message };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    ensureValidId(userId);
    await checkStudentId(userId);
    
    if (typeof status !== 'boolean') {
        throw new ApiError(400, "Status must be a boolean");
    }

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to change student status");
    }

    return { message: "Student status changed successfully" };
}

const removeStudent = async (id) => {
    ensureValidId(id);
    await checkStudentId(id);

    try {
        const affectedRow = await deleteStudent(id);
        if (affectedRow <= 0) {
            throw new ApiError(500, "Unable to delete student");
        }

        return { message: "Student deleted successfully" };
    } catch (error) {
        if (error.message === "Student not found") {
            throw new ApiError(404, "Student not found");
        }
        throw new ApiError(500, "Unable to delete student");
    }
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    removeStudent,
};
