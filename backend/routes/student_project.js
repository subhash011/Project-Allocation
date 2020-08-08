const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");

async function canUpdateProject(res, idToken, id) {
    let student = await Student.findOne({ google_id: { id: id, idToken: idToken } })
        .lean()
        .select("_id stream");
    if(!student) {
        res.json({ message: "invalid-token" });
        return false;
    }
    let admin = await Admin.findOne({ stream: student.stream })
        .lean()
        .select("stage");

    if(admin.stage < 1) {
        res.json({message: "stage-not-started"});
        return false;
    } else if(admin.stage >= 2) {
        res.json({message: "stage-ended"});
        return false;
    }
    return student;
}


//fetch project details of the student's stream
router.get("/:id", (req, res) => {
    const student_projects = [];
    const id = req.params.id;
	const idToken = req.headers.authorization;
    Student.findOne({ google_id: { id: id, idToken: idToken } })
        .lean()
        .select("stream")
        .then((student) => {
            if (student) {
                return student["stream"];
            } else {
                res.json({
                    message: "token-expired",
                });
                return null;
            }
        })
        .then((stream) => {
            if (stream) {
                Project.find({ stream: stream })
                    .lean()
                    .select("-students_id -student_alloted -isIncluded -__v")
                    .populate({
                        path: "faculty_id",
                        select: "name email",
                        model: Faculty,
                    })
                    .then((projects) => {
                        for (const project of projects) {
                            const details = {
                                _id: project["_id"],
                                title: project["title"],
                                description: project["description"],
                                duration: project["duration"],
                                studentIntake: project["studentIntake"],
                                faculty_name: project["faculty_id"]["name"],
                                faculty_email: project["faculty_id"]["email"],
                            };
                            student_projects.push(details);
                        }
                        res.json({
                            message: "success",
                            result: student_projects,
                        });
                    });
            }
        })
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
})
//fetch student preferences
router.get("/preference/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	Student.findOne({ google_id: { id: id, idToken: idToken } })
		.lean()
		.populate({
			path: "projects_preference",
			select: {
				_id: 1,
				title: 1,
				description: 1,
				duration: 1,
				studentIntake: 1,
			},
			model: Project,
			populate: {
				path: "faculty_id",
				select: {
					name: 1,
					email: 1,
				},
				model: Faculty,
			},
		})
		.then((student) => {
			if (student) {
                const answer = student.projects_preference.map((val) => {
                    return {
                        _id: val._id,
                        title: val.title,
                        description: val.description,
                        duration: val.duration,
                        studentIntake: val.studentIntake,
                        faculty_name: val.faculty_id.name,
                        faculty_email: val.faculty_id.email,
                    };
                });
                res.json({
					message: "success",
					result: answer,
				});
			} else {
				res.json({
					message: "invalid-token",
					result: null,
				});
			}
		})
		.catch(() => {
			res.json({
				message: "invalid-token",
				result: null,
			});
		});
});

router.post("/preference/:id", async (req, res) => {
    const id = req.params.id;
	let projects = req.body;
	const project_idArr = projects.map((val) =>
		mongoose.Types.ObjectId(val["_id"])
	);
	const idToken = req.headers.authorization;

    let student = await canUpdateProject(res, idToken, id);

    if(!student) {
        return;
    }
    let studentID = student._id;

    let populator = {
        path: "projects_preference",
        select: {
            _id: 1,
            title: 1,
            description: 1,
            duration: 1,
            studentIntake: 1,
        },
        model: Project,
        populate: {
            path: "faculty_id",
            select: {
                name: 1,
                email: 1,
            },
            model: Faculty,
        },
    }
    student = await Student.findByIdAndUpdate(studentID, {projects_preference: project_idArr}, {new: true}).select("-google_id -date -__v").populate(populator);
    const answer = student.projects_preference.map((val) => {
            return {
                _id: val._id,
                title: val.title,
                description: val.description,
                duration: val.duration,
                studentIntake: val.studentIntake,
                faculty_name: val.faculty_id.name,
                faculty_email: val.faculty_id.email,
            };
        }
    );
    res.json({message:"success", result: answer})
})


router.post("/append/preference/:id", async(req, res) => {
    const id = req.params.id;
	let projects = req.body;
	const project_idArr = projects;
	const idToken = req.headers.authorization;
    let student = await canUpdateProject(res, idToken, id);

    if(!student) {
        return;
    }
    let updateResult = {
        $push: {projects_preference: {$each: project_idArr}},
    };
    await Student.findByIdAndUpdate(student._id, updateResult);
    const studentStream = student.stream;
    const studentID = student._id;
    const updateCondition = {
        stream: studentStream,
        _id: {$in: project_idArr},
    };
    updateResult = {
        $addToSet: { students_id: studentID },
        $pull: { not_students_id: studentID }
    };
    await Project.updateMany(updateCondition, updateResult);
    projects = await Project.find(updateCondition).populate({path: "students_id", select:"_id gpa", model:Student});
    let promises = []
    for (let project of projects) {
        project.students_id.sort((a,b) => b.gpa - a.gpa);
        promises.push(project.save());
    }
    await Promise.all(promises);
    res.json({message:"success"})
});

router.post("/remove/preference/:id", async(req, res) => {
    const id = req.params.id;
	const project = req.body.preference;
	const idToken = req.headers.authorization;
    let updateResult = {
        $pull: {projects_preference: project},
    };
    let student = await canUpdateProject(res, idToken, id);
    let studentID = student._id;
    if(!student) {
        return;
    }
    let _id = mongoose.Types.ObjectId(project);
    await Student.findByIdAndUpdate(student._id, updateResult);
    updateResult = {
        $pull: {students_id: studentID},
        $addToSet: { not_students_id: studentID }
    }
    await Project.findByIdAndUpdate(_id, updateResult);
    let projects = await Project.findById(_id).populate({path: "not_students_id", select: "_id gpa", model: Student});
    let promises = []
    for (let project of [projects]) {
        project.not_students_id.sort((a,b) => b.gpa - a.gpa);
        promises.push(project.save());
    }
    await Promise.all(promises);
    res.json({message:"success"})
})


router.post("/add/preference/:id", async(req, res) => {
    const id = req.params.id;
	let project = req.body.preference;
	const idToken = req.headers.authorization;
    let updateResult = {
        $push: {projects_preference: project},
    };
    let student = await canUpdateProject(res, idToken, id);

    if(!student) {
        return;
    }
    await Student.findByIdAndUpdate(student._id, updateResult);
    let _id = mongoose.Types.ObjectId(project);
    updateResult = {
        $pull:{ not_students_id: student._id },
        $addToSet:{students_id: student._id}
    }
    await Project.findByIdAndUpdate(_id, updateResult);
    let projects = await Project.findById(_id).populate({path: "students_id", select:"_id gpa", model:Student});
    let promises = []
    for (let project of [projects]) {
        project.students_id.sort((a,b) => b.gpa - a.gpa);
        promises.push(project.save());
    }
    await Project.findByIdAndUpdate(_id, updateResult);
    res.json({message:"success"});
})

router.get("/assert/order", async(req, res) => {
    let students = await Student.find({stream:"UGCSE", isRegistered:true}).lean().select("_id name gpa roll_no").sort([["gpa", -1]]);
    let projects = await Project.find({stream: "UGCSE"}).lean().populate({
        path:"students_id",
        select:"_id name gpa roll_no",
        model:Student
    }).populate({
        path:"not_students_id",
        select:"_id name gpa roll_no",
        model:Student
    });
    let a = students.map(val => val._id.toString());
    let ans = {}
    let overall = true;
    for (let project of projects) {
        ans[project._id] = [true, true, true]
        let so = project.students_id.sort((a, b) => b.gpa - a.gpa);
        let sno = project.not_students_id.sort((a, b) => b.gpa - a.gpa);
        so = so.map(value => value._id.toString());
        sno = sno.map(value => value._id.toString());
        if (so.length + sno.length !== a.length) {
            ans[project._id][2] = false;
            overall = false;
        }
        if (!isSubsequence(a, so)) {
            ans[project._id][0] = false;
            overall = false;
        }
        if (!isSubsequence(a, sno)) {
            ans[project._id][1] = false;
            overall = false;
        }
    }
    res.json({overall, ans})
})


function isSubsequence(arrayA, arrayB) {
    let b = 0;
    for (let i = 0; i < arrayA.length; i++) {
        if(arrayA[i] == arrayB[b]) {
            b++;
            if(b == arrayB.length) {
                break;
            }
        }
    }
    return b === arrayB.length;
}

module.exports = router;
