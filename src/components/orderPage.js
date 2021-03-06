import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import Button from '@material-ui/core/Button';
import { Input } from 'antd';
import { Modal } from 'antd';
import { message } from 'antd';
import {
    Form, Select, AutoComplete,
} from 'antd';
import { getAllOrders,getAllParkingClerks, assignOrdersToParkingClerks } from '../util/APIUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

const actionsStyles = theme => ({
    root: {
        flexShrink: 0,
        color: theme.palette.text.secondary,
        marginLeft: theme.spacing.unit * 2.5,
    },
});

class TablePaginationActions extends React.Component {
    handleFirstPageButtonClick = event => {
        this.props.onChangePage(event, 0);
    };

    handleBackButtonClick = event => {
        this.props.onChangePage(event, this.props.page - 1);
    };

    handleNextButtonClick = event => {
        this.props.onChangePage(event, this.props.page + 1);
    };

    handleLastPageButtonClick = event => {
        this.props.onChangePage(
            event,
            Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
        );
    };
	searchByName = (value)=>{fetch('https://parkingsystem.herokuapp.com/orders')
            .then(results => results.json())
            .then(res => {
				const result = res.filter((order)=>{ return order.carNumber.includes(value)})
                this.setState({ rows: result });
            });}

    render() {
        const { classes, count, page, rowsPerPage, theme } = this.props;

        return (
            <div className={classes.root}>
                <IconButton
                    onClick={this.handleFirstPageButtonClick}
                    disabled={page === 0}
                    aria-label="First Page"
                >
                    {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
                </IconButton>
                <IconButton
                    onClick={this.handleBackButtonClick}
                    disabled={page === 0}
                    aria-label="Previous Page"
                >
                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                </IconButton>
                <IconButton
                    onClick={this.handleNextButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="Next Page"
                >
                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                </IconButton>
                <IconButton
                    onClick={this.handleLastPageButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="Last Page"
                >
                    {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
                </IconButton>
            </div>
        );
    }
}

TablePaginationActions.propTypes = {
    classes: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    theme: PropTypes.object.isRequired,
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
    TablePaginationActions,
);

let counter = 0;
function createData(orderId, carNumber, requestType, status, choice) {
    counter += 1;
    return { id: counter, orderId, carNumber, requestType, status, choice };
}

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    table: {
        minWidth: 500,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class CustomPaginationActionsTable extends React.Component {
    state = {
		rows: [],
        page: 0,
        rowsPerPage: 10,
		activeModal: null,
		visible: false,
		selectedClerkId:-1,
		parkingclecks: [],
		id:-1
    };
	
	componentDidMount(){
        // fetch('https://parkingsystem.herokuapp.com/orders')
        // .then(results => results.json())
        getAllOrders()
        .then(res => {
        this.setState({rows:res});
        });
		// fetch('https://parkingsystem.herokuapp.com/parkingclerks/')
        // .then(results => results.json())
        getAllParkingClerks()
        .then(res => {
        this.setState({ parkingclecks: res });
        });
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };
	
	handleCancel = () => {
        this.setState({ visible: false, activeModal: null });
    }

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };
	
	changeRequestTypeToChinese = (e) => {
		if(e == "parking") {
			return "Parking"
		}return "Pick up"
	}
	
	
	changeStatusToBinaryClassification = (e)=> {
		if (e == "pendingParking") {
			return "Pending"
		}
		if (e == "completed") {
			return "Completed"
		}
		return "Parking/Picking Up"
		
	}
	submitAssignRequest = () =>{console.log(this.state)}
	
	showModal = (type) => {
        this.setState({
            visible: true,
            activeModal: type,
        });
    }
	
	passDatatoModal = (type,id) => {
        this.setState({
            id
        })
        this.showModal(type);
    }
	
	assignParkingClerkToOrder = (row)=>{
		if (row.status == "pendingParking"){
			return <a onClick={() => this.passDatatoModal("Associate",row.id)}> Assign</a>
		}
	}
	submitAssignRequest = (state) => {
        // fetch("https://parkingsystem.herokuapp.com/parkingclerks/"+state.selectedClerkId+'/orders',
        //     {
        //         method: 'POST', headers: new Headers({
        //             'Content-Type': 'application/json'
        //         }), mode: 'cors',
        //         body: JSON.stringify({
        //             parkingOrderId: state.id
        //         })
        //     })
        //     .then(res => res.json())
        assignOrdersToParkingClerks(state.selectedClerkId,{parkingOrderId: state.id})
            .then(res => console.log(res))
        message.success('A Parking Clerk is assigned', 1);
		
		setTimeout(() => {
            this.setState({ activeModal: null });
            // fetch('https://parkingsystem.herokuapp.com/orders')
            // .then(results => results.json())
            getAllOrders()
            .then(res => {
            this.setState({rows:res});
            });
        }, 2500);
		}
	

    render() {
        const { classes } = this.props;
        const { rows, page, rowsPerPage, activeModal, visible, selectedClerkId, parkingclecks,id } = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
        const Search = Input.Search;
        return (
            <Paper className={classes.root}>
                {/* <div>
                    <Search style={{ padding: '5px', width: 200, float: 'right', marginTop: '10px', marginBottom: '10px', marginRight: '10px' }}
                        placeholder="輸入文字搜索"
                        onSearch={value => console.log(value)}
                        enterButton
                    />
                </div> */}
                
                <div>
                <Button style={{ padding: '10px', background: '#ffffff', color: 'white', marginTop: '10px', marginLeft: '10px', marginBottom: '10px' }} className={classes.button} disabled> </Button>
                </div>
                
                <div className={classes.tableWrapper}>

                    <Table className={classes.table}>
                        <TableHead >
                            <TableRow style={{ background: '#fafafa' }}>
                                <TableCell style={{ color: 'black' }}><h3>ID</h3></TableCell>
                                <TableCell style={{ color: 'black' }}><h3>Car Number</h3></TableCell>
                                <TableCell style={{ color: 'black' }}><h3>Request Type</h3></TableCell>
                                <TableCell style={{ color: 'black' }}><h3>Status</h3></TableCell>
                                <TableCell style={{ color: 'black' }}><h3>Edit</h3></TableCell>

                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {this.state.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell component="th" scope="row">
                                            {row.id}
                                        </TableCell>
                                        <TableCell>{row.carNumber}</TableCell>
                                        <TableCell>{this.changeRequestTypeToChinese(row.requestType)}</TableCell>
                                        <TableCell>{this.changeStatusToBinaryClassification(row.status)}</TableCell>
                                        <TableCell>{this.assignParkingClerkToOrder(row)}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 48 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination  
                                    rowsPerPageOptions={[10, 20, 30]}
                                    colSpan={3}
                                    count={rows.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                    ActionsComponent={TablePaginationActionsWrapped}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                <Modal
                    title="Assign"
                    visible={activeModal === "Associate"}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
                        <Button key="submit" type="primary" onClick={()=>this.submitAssignRequest(this.state)}>
                            Confirm
                    </Button>,
                    ]}
                >
                    <Form layout="vertical">
					    <FormItem label="Assign">
                            <Select onChange={(e) => this.setState({ selectedClerkId: e })}>
                                {this.state.parkingclecks.map(
                                    parkingCleck => {
                                        return (<Option value={parkingCleck.id} key={parkingCleck.id}>{parkingCleck.name}</Option>);
                                    }
                                )}
                            </Select>

                        </FormItem>
                    </Form>
                </Modal>
            </Paper>
        );
    }
}

CustomPaginationActionsTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomPaginationActionsTable);
